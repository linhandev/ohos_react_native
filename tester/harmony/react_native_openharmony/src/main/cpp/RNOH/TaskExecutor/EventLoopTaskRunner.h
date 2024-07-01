#pragma once

#include <atomic>
#include <functional>
#include <mutex>
#include <queue>
#include <thread>
#include "AbstractTaskRunner.h"
#include "DefaultExceptionHandler.h"
#include "uv/Async.h"
#include "uv/EventLoop.h"
#include "uv/Timer.h"

namespace rnoh {
class EventLoopTaskRunner final : public AbstractTaskRunner {
 public:
  EventLoopTaskRunner(
      std::string name,
      ExceptionHandler exceptionHandler = defaultExceptionHandler);
  ~EventLoopTaskRunner() override;

  EventLoopTaskRunner(const EventLoopTaskRunner&) = delete;
  EventLoopTaskRunner& operator=(const EventLoopTaskRunner&) = delete;

  void runAsyncTask(Task&& task) override;
  void runSyncTask(Task&& task) override;

  bool isOnCurrentThread() const override;

  void setExceptionHandler(ExceptionHandler handler) override;

 private:
  void executeTask();
  void runLoop();

  std::string m_name;
  std::atomic_bool m_running{true};
  std::thread m_thread;
  std::queue<Task> m_asyncTaskQueue{};
  std::queue<Task> m_syncTaskQueue{};
  std::mutex m_taskQueueMutex;
  std::condition_variable m_syncTaskCv;
  uv::EventLoop m_eventLoop;
  std::unique_ptr<uv::Async> m_asyncHandle;
  ExceptionHandler m_exceptionHandler;
};
} // namespace rnoh