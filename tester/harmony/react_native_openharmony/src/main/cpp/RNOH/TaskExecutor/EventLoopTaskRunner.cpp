#include "EventLoopTaskRunner.h"
#include <glog/logging.h>

namespace rnoh {
EventLoopTaskRunner::EventLoopTaskRunner(
    std::string name,
    ExceptionHandler exceptionHandler)
    : m_name(name),
      m_asyncHandle(std::make_unique<uv::Async>(
          m_eventLoop.handle(),
          [this] { this->executeTask(); })),
      m_exceptionHandler(std::move(exceptionHandler)) {
  m_thread = std::thread([this] { this->runLoop(); });
}

EventLoopTaskRunner::~EventLoopTaskRunner() {
  DLOG(INFO) << "EventLoopTaskRunner::~EventLoopTaskRunner()";
  m_running = false;
  m_asyncHandle->send();
  m_syncTaskCv.notify_all();
  m_thread.join();
}

void EventLoopTaskRunner::runAsyncTask(Task&& task) {
  {
    std::lock_guard<std::mutex> lock(m_taskQueueMutex);
    m_asyncTaskQueue.push(std::move(task));
  }
  m_asyncHandle->send();
}

void EventLoopTaskRunner::runSyncTask(Task&& task) {
  if (isOnCurrentThread()) {
    task();
    return;
  }

  std::unique_lock<std::mutex> lock(m_taskQueueMutex);
  std::atomic_bool done{false};
  m_syncTaskQueue.push([task = std::move(task), &done] {
    task();
    done = true;
  });
  m_asyncHandle->send();
  m_syncTaskCv.wait(
      lock, [this, &done] { return !m_running.load() || done.load(); });
}

bool EventLoopTaskRunner::isOnCurrentThread() const {
  return m_thread.get_id() == std::this_thread::get_id();
}

void EventLoopTaskRunner::setExceptionHandler(ExceptionHandler handler) {
  m_exceptionHandler = std::move(handler);
}

void EventLoopTaskRunner::executeTask() {
  Task task = nullptr;
  bool isSyncTask = false;
  if (!m_running) {
    std::lock_guard<std::mutex> lock(m_taskQueueMutex);
    m_asyncHandle.reset();
    m_syncTaskQueue = {};
    m_asyncTaskQueue = {};
    return;
  }
  {
    std::lock_guard<std::mutex> lock(m_taskQueueMutex);
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
      task();
      if (isSyncTask) {
        m_syncTaskCv.notify_all();
      }
    } catch (...) {
      m_exceptionHandler(std::current_exception());
    }
  }
  {
    std::lock_guard<std::mutex> lock(m_taskQueueMutex);
    if (!m_syncTaskQueue.empty() || !m_asyncTaskQueue.empty()) {
      m_asyncHandle->send();
    }
  }
}

void EventLoopTaskRunner::runLoop() {
  m_eventLoop.run();
  DLOG(INFO) << "EventLoopTaskRunner exiting event loop";
}

} // namespace rnoh