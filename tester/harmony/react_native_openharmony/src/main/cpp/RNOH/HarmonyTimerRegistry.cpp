#include "HarmonyTimerRegistry.h"
#include "RNOH/Performance/HarmonyReactMarker.h"

namespace rnoh {

static double getMillisSinceEpoch() {
  return std::chrono::duration_cast<std::chrono::milliseconds>(
             std::chrono::system_clock::now().time_since_epoch())
      .count();
}

HarmonyTimerRegistry::HarmonyTimerRegistry(TaskExecutor::Shared taskExecutor)
    : m_taskExecutor(std::move(taskExecutor)) {}

void HarmonyTimerRegistry::createTimer(uint32_t timerId, double delayMs) {
  assertJSThread();

  // for short-lived, one-off timers, schedule them immediately after they are
  // created
  if (delayMs == 0) {
    triggerTimers({timerId});
    return;
  }

  auto now = getMillisSinceEpoch();
  auto deadline = now + delayMs;
  m_activeTimerById.emplace(timerId, Timer{timerId, deadline, delayMs, false});

  if (isForeground && !m_vsyncListener->isScheduled()) {
    scheduleWakeUp();
  }
};

void HarmonyTimerRegistry::deleteTimer(uint32_t timerId) {
  assertJSThread();
  m_activeTimerById.erase(timerId);
};

void HarmonyTimerRegistry::createRecurringTimer(
    uint32_t timerId,
    double delayMs) {
  assertJSThread();

  auto now = getMillisSinceEpoch();
  auto deadline = now + delayMs;
  m_activeTimerById.emplace(timerId, Timer{timerId, deadline, delayMs, true});

  if (isForeground && !m_vsyncListener->isScheduled()) {
    scheduleWakeUp();
  }
};

HarmonyTimerRegistry::~HarmonyTimerRegistry() noexcept {
  if (m_wakeUpTask.has_value()) {
    m_taskExecutor->cancelDelayedTask(m_wakeUpTask.value());
  }
  m_taskExecutor->runTask(
      TaskThread::MAIN,
      [lifecycleObserver = std::move(m_lifecycleObserver)] {});
}

void HarmonyTimerRegistry::onForeground() {
  assertJSThread();
  if (!isForeground) {
    isForeground = true;
    resumeTimers();
  }
}

void HarmonyTimerRegistry::onBackground() {
  assertJSThread();
  if (isForeground) {
    isForeground = false;
    pauseTimers();
  }
}

void HarmonyTimerRegistry::LifecycleObserver::onMessageReceived(
    ArkTSMessage const& message) {
  if (message.name == "FOREGROUND") {
    m_timerRegistry->onForeground();
  } else if (message.name == "BACKGROUND") {
    m_timerRegistry->onBackground();
  }
}

void HarmonyTimerRegistry::triggerTimers(
    std::vector<uint32_t> const& timerIds) {
  assertJSThread();
  if (auto timerManager = m_timerManager.lock()) {
    for (auto timerId : timerIds) {
      timerManager->callTimer(timerId);
    }
  }
  for (auto id : timerIds) {
    auto it = m_activeTimerById.find(id);
    if (it == m_activeTimerById.end()) {
      continue;
    }

    auto& timer = it->second;

    if (timer.repeats) {
      timer.deadlineMs += timer.durationMs;
    } else {
      m_activeTimerById.erase(it);
    }
  }
}

void HarmonyTimerRegistry::resumeTimers() {
  assertJSThread();
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::ON_HOST_RESUME_START);
  triggerExpiredTimers();
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::ON_HOST_RESUME_END);
}

void HarmonyTimerRegistry::pauseTimers() {
  assertJSThread();
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::ON_HOST_PAUSE_START);
  cancelWakeUp();
  HarmonyReactMarker::logMarker(
      HarmonyReactMarker::HarmonyReactMarkerId::ON_HOST_PAUSE_END);
}

void HarmonyTimerRegistry::assertJSThread() const {
  RNOH_ASSERT(m_taskExecutor->isOnTaskThread(TaskThread::JS));
}

void HarmonyTimerRegistry::triggerExpiredTimers() {
  assertJSThread();
  if (!isForeground) {
    return;
  }
  std::vector<Timer> expiredTimers;
  auto now = getMillisSinceEpoch();
  // NOTE: a possible optimization is to keep a std::priority_queue of timer ids
  // here, ordered by the deadline of the timer. We assume there's only a few
  // timers scheduled at each time, and the overhead of maintaining the queue is
  // not worth it
  for (auto const& [id, timer] : m_activeTimerById) {
    if (timer.deadlineMs <= now) {
      expiredTimers.push_back(timer);
    }
  }
  if (!expiredTimers.empty()) {
    // timers with earlier deadlines should fire sooner
    std::sort(expiredTimers.begin(), expiredTimers.end(), [](auto a, auto b) {
      return a.deadlineMs < b.deadlineMs;
    });
    std::vector<uint32_t> expiredTimerIds;
    std::transform(
        expiredTimers.begin(),
        expiredTimers.end(),
        std::back_inserter(expiredTimerIds),
        [](auto timer) { return timer.id; });
    triggerTimers(expiredTimerIds);
  }

  if (!m_activeTimerById.empty()) {
    scheduleWakeUp();
  }
}

void HarmonyTimerRegistry::cancelWakeUp() {
  assertJSThread();
  m_nextTimerDeadline = std::numeric_limits<double>::max();
  if (m_wakeUpTask.has_value()) {
    m_taskExecutor->cancelDelayedTask(m_wakeUpTask.value());
    m_wakeUpTask.reset();
  }
}

double HarmonyTimerRegistry::getNextDeadline() {
  double nextDeadline = std::numeric_limits<double>::max();

  for (auto const& [id, timer] : m_activeTimerById) {
    nextDeadline = std::min(timer.deadlineMs, nextDeadline);
  }
  return nextDeadline;
}

void HarmonyTimerRegistry::scheduleWakeUp() {
  assertJSThread();
  // NOTE: following the iOS implementation, if there's a scheduled timer which
  // will expire soon (< 1s), we don't schedule a delayed task on the executor,
  // checking the scheduled timers on the next few frames instead.
  constexpr double MINIMUM_SLEEP_DELAY = 1000.;

  auto nextDeadline = getNextDeadline();
  auto now = getMillisSinceEpoch();
  auto delay = nextDeadline - now;

  if (delay >= MINIMUM_SLEEP_DELAY) {
    if (nextDeadline >= m_nextTimerDeadline) {
      return;
    }
    m_nextTimerDeadline = nextDeadline;
    cancelWakeUp();
    m_wakeUpTask = m_taskExecutor->runDelayedTask(
        TaskThread::JS,
        [weakSelf = getWeakSelf()] {
          if (auto self = weakSelf.lock()) {
            self->m_nextTimerDeadline = std::numeric_limits<double>::max();
            self->triggerExpiredTimers();
          }
        },
        std::max(delay, 0.));
  } else {
    m_vsyncListener->requestFrame(
        [taskExecutor = m_taskExecutor, weakSelf = getWeakSelf()](auto) {
          taskExecutor->runTask(TaskThread::JS, [weakSelf] {
            if (auto self = weakSelf.lock()) {
              self->triggerExpiredTimers();
            }
          });
        });
  }
}

void HarmonyTimerRegistry::setTimerManager(
    std::weak_ptr<facebook::react::TimerManager> timerManager) {
  m_timerManager = timerManager;
}

std::weak_ptr<HarmonyTimerRegistry> HarmonyTimerRegistry::getWeakSelf() {
  // NOTE: this is safe because HarmonyTimerRegistry is owned by a `unique_ptr`
  // in `TimerManager` which is never reset, meaning we live as long as the
  // `m_timerManager` pointer is valid
  if (auto timerManager = m_timerManager.lock()) {
    std::shared_ptr<HarmonyTimerRegistry> shared(timerManager, this);
    return std::weak_ptr(shared);
  }
  return {};
}

} // namespace rnoh
