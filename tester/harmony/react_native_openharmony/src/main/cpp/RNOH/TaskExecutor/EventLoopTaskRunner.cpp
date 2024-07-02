#include "EventLoopTaskRunner.h"
#include <glog/logging.h>
#include <react/renderer/debug/SystraceSection.h>
#include "RNOH/Assert.h"

namespace rnoh {
EventLoopTaskRunner::EventLoopTaskRunner(
    std::string name,
    uv_loop_t* loop,
    ExceptionHandler exceptionHandler)
    : m_name(name),
      m_loop(loop),
      m_asyncHandle(
          std::make_unique<uv::Async>(m_loop, [this] { this->executeTask(); })),
      m_exceptionHandler(std::move(exceptionHandler)) {}

EventLoopTaskRunner::~EventLoopTaskRunner() {
  DLOG(INFO) << "EventLoopTaskRunner::~EventLoopTaskRunner()";
  m_running = false;
  m_asyncHandle->send();
  m_syncTaskCv.notify_all();
}

void EventLoopTaskRunner::runAsyncTask(Task&& task) {
  {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_asyncTaskQueue.push(std::move(task));
  }
  m_asyncHandle->send();
}

void EventLoopTaskRunner::runSyncTask(Task&& task) {
  if (isOnCurrentThread()) {
    task();
    return;
  }

  std::unique_lock<std::mutex> lock(m_mutex);
  std::atomic_bool done{false};
  m_syncTaskQueue.push([task = std::move(task), &done] {
    task();
    done = true;
  });
  m_asyncHandle->send();
  m_syncTaskCv.wait(
      lock, [this, &done] { return !m_running.load() || done.load(); });
}

EventLoopTaskRunner::DelayedTaskId EventLoopTaskRunner::runDelayedTask(
    Task&& task,
    uint64_t delayMs,
    uint64_t repeatMs) {
  auto id = m_nextTaskId++;
  runAsyncTask([this, id, delayMs, repeatMs, task = std::move(task)] {
    auto [it, inserted] = m_timerByTaskId.emplace(
        id,
        uv::Timer(
            m_loop,
            [this, id, repeatMs, task = std::move(task)] {
              task();
              if (repeatMs == 0) {
                m_timerByTaskId.erase(id);
              }
            },
            delayMs,
            repeatMs));
  });
  return id;
}

void EventLoopTaskRunner::cancelDelayedTask(DelayedTaskId taskId) {
  runAsyncTask([this, taskId] {
    auto it = m_timerByTaskId.find(taskId);
    if (it != m_timerByTaskId.end()) {
      m_timerByTaskId.erase(it);
    }
  });
}

void EventLoopTaskRunner::setExceptionHandler(ExceptionHandler handler) {
  m_exceptionHandler = std::move(handler);
}

void EventLoopTaskRunner::executeTask() {
  Task task = nullptr;
  bool isSyncTask = false;
  if (!m_running) {
    // TODO: this is wrong -- we need to refine how task runners are stopped
    // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/1130
    std::lock_guard<std::mutex> lock(m_mutex);
    m_asyncHandle.reset();
    m_syncTaskQueue = {};
    m_asyncTaskQueue = {};
    m_timerByTaskId.clear();
    return;
  }
  {
    std::lock_guard<std::mutex> lock(m_mutex);
    if (!m_syncTaskQueue.empty()) {
      task = std::move(m_syncTaskQueue.front());
      m_syncTaskQueue.pop();
      isSyncTask = true;
    } else if (!m_asyncTaskQueue.empty()) {
      task = std::move(m_asyncTaskQueue.front());
      m_asyncTaskQueue.pop();
    }
  }
  if (task) {
    try {
      facebook::react::SystraceSection s("#RNOH::TaskRunner::task");
      task();
      if (isSyncTask) {
        m_syncTaskCv.notify_all();
      }
    } catch (...) {
      m_exceptionHandler(std::current_exception());
    }
  }
  {
    std::lock_guard<std::mutex> lock(m_mutex);
    if (!m_syncTaskQueue.empty() || !m_asyncTaskQueue.empty()) {
      m_asyncHandle->send();
    }
  }
}

} // namespace rnoh