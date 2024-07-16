#include "TimingTurboModule.h"
#include "RNOH/Assert.h"
#include "RNOH/RNInstance.h"

namespace rnoh {

using namespace facebook;

static jsi::Value __hostFunction_TimingTurboModule_createTimer(
    jsi::Runtime& /*rt*/,
    react::TurboModule& turboModule,
    const jsi::Value* args,
    size_t count) {
  RNOH_ASSERT(count == 4);
  auto& self = static_cast<TimingTurboModule&>(turboModule);
  auto id = args[0].getNumber();
  auto duration = args[1].getNumber();
  auto jsSchedulingTIme = args[2].getNumber();
  auto repeats = args[3].getBool();
  self.createTimer(id, duration, jsSchedulingTIme, repeats);
  return jsi::Value::undefined();
}
static jsi::Value __hostFunction_TimingTurboModule_deleteTimer(
    jsi::Runtime& /*rt*/,
    react::TurboModule& turboModule,
    const jsi::Value* args,
    size_t count) {
  RNOH_ASSERT(count == 1);
  auto id = args[0].getNumber();
  static_cast<TimingTurboModule&>(turboModule).deleteTimer(id);
  return jsi::Value::undefined();
}
static jsi::Value __hostFunction_TimingTurboModule_setSendIdleEvents(
    jsi::Runtime& /*rt*/,
    react::TurboModule& turboModule,
    const jsi::Value* args,
    size_t count) {
  RNOH_ASSERT(count == 1);
  auto sendIdleEvents = args[0].getBool();
  static_cast<TimingTurboModule&>(turboModule)
      .setSendIdleEvents(sendIdleEvents);
  return jsi::Value::undefined();
}

TimingTurboModule::TimingTurboModule(
    const ArkTSTurboModule::Context ctx,
    const std::string name)
    : ArkTSTurboModule(ctx, name) {
  methodMap_ = {
      {"createTimer", {4, __hostFunction_TimingTurboModule_createTimer}},
      {"deleteTimer", {1, __hostFunction_TimingTurboModule_deleteTimer}},
      {"setSendIdleEvents",
       {1, __hostFunction_TimingTurboModule_setSendIdleEvents}},
  };

  // LifecycleObserver must be created on the main thread
  m_ctx.taskExecutor->runTask(
      TaskThread::MAIN, [weakInstance = m_ctx.instance] {
        auto instance = weakInstance.lock();
        if (!instance) {
          return;
        }
        // since this task is scheduled from `TimingTurboModule` constructor,
        // we cannot capture `weak_from_this()` into the task, and must use
        // RNInstance to get the TurboModule instead
        auto self = instance->getTurboModule<TimingTurboModule>("Timing");
        if (!self) {
          return;
        }
        if (self->m_lifecycleObserver) {
          return;
        }
        auto messageHub = self->m_ctx.arkTSMessageHub;
        self->m_lifecycleObserver = std::make_shared<LifecycleObserver>(
            self->weak_from_this(), messageHub);
      });
}

TimingTurboModule::~TimingTurboModule() {
  for (auto& it : m_timerTaskById) {
    m_ctx.taskExecutor->cancelDelayedTask(it.second);
  }
  m_ctx.taskExecutor->runTask(
      TaskThread::MAIN,
      [lifecycleObserver = std::move(m_lifecycleObserver)] {});
}

void TimingTurboModule::createTimer(
    double id,
    double duration,
    double jsSchedulingTime,
    bool repeats) {
  assertJSThread();
  auto millisSinceEpoch =
      std::chrono::duration_cast<std::chrono::milliseconds>(
          std::chrono::system_clock::now().time_since_epoch())
          .count();
  auto delay = millisSinceEpoch - int64_t(jsSchedulingTime);

  if (isForeground) {
    auto timerTask = m_ctx.taskExecutor->runDelayedTask(
        TaskThread::JS,
        [weakSelf = weak_from_this(), id, repeats] {
          auto self = weakSelf.lock();
          if (!self) {
            return;
          }
          self->triggerTimer(id);
        },
        duration - delay,
        repeats ? duration : 0);

    m_timerTaskById.emplace(id, timerTask);
  }
  m_activeTimerById.emplace(id, Timer{id, duration, jsSchedulingTime, repeats});
}

void TimingTurboModule::deleteTimer(double id) {
  assertJSThread();
  m_activeTimerById.erase(id);

  auto it = m_timerTaskById.find(id);
  if (it == m_timerTaskById.end()) {
    return;
  }

  m_ctx.taskExecutor->cancelDelayedTask(it->second);
  m_timerTaskById.erase(it);
}

void TimingTurboModule::setSendIdleEvents(bool /*sendIdleEvents*/) {
  LOG(WARNING) << "TimingTurboModule::setSendIdleEvents is not implemented";
}

void TimingTurboModule::onForeground() {
  m_ctx.taskExecutor->runTask(TaskThread::JS, [weakSelf = weak_from_this()] {
    auto self = weakSelf.lock();
    if (!self) {
      return;
    }
    if (!self->isForeground) {
      self->isForeground = true;
      self->resumeTimers();
    }
  });
}

void TimingTurboModule::onBackground() {
  m_ctx.taskExecutor->runTask(TaskThread::JS, [weakSelf = weak_from_this()] {
    auto self = weakSelf.lock();
    if (!self) {
      return;
    }
    self->isForeground = false;
    self->pauseTimers();
  });
}

void TimingTurboModule::LifecycleObserver::onMessageReceived(
    ArkTSMessage const& message) {
  auto timingModule = m_timingTurboModule.lock();
  if (!timingModule) {
    return;
  }

  if (message.name == "FOREGROUND") {
    timingModule->onForeground();
  } else if (message.name == "BACKGROUND") {
    timingModule->onBackground();
  }
}

void TimingTurboModule::triggerTimer(double id) {
  assertJSThread();
  auto instance = m_ctx.instance.lock();
  if (instance) {
    instance->callJSFunction(
        "JSTimers",
        "callTimers",
        folly::dynamic::array(folly::dynamic::array(id)));
  }
  auto it = m_activeTimerById.find(id);
  if (it == m_activeTimerById.end()) {
    return;
  }
  if (!it->second.repeats) {
    m_activeTimerById.erase(it);
    m_timerTaskById.erase(id);
    return;
  }
}

void TimingTurboModule::resumeTimers() {
  assertJSThread();
  for (auto& it : m_activeTimerById) {
    createTimer(
        it.second.id,
        it.second.duration,
        it.second.jsSchedulingTime,
        it.second.repeats);
  }
}

void TimingTurboModule::pauseTimers() {
  assertJSThread();
  for (auto& [id, task] : m_timerTaskById) {
    m_ctx.taskExecutor->cancelDelayedTask(task);
  }
  m_timerTaskById.clear();
}

void TimingTurboModule::assertJSThread() const {
  RNOH_ASSERT(m_ctx.taskExecutor->isOnTaskThread(TaskThread::JS));
}

} // namespace rnoh