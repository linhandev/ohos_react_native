#pragma once

#include <exception>
#include <functional>

class AbstractTaskRunner {
 public:
  using Shared = std::shared_ptr<AbstractTaskRunner>;
  using Task = std::function<void()>;
  using DelayedTaskId = uint64_t;
  using ExceptionHandler = std::function<void(std::exception_ptr const)>;

  virtual void runAsyncTask(Task&& task) = 0;
  virtual void runSyncTask(Task&& task) = 0;
  virtual DelayedTaskId
  runDelayedTask(Task&& task, uint64_t delayMs, uint64_t repeatMs = 0) = 0;
  virtual void cancelDelayedTask(DelayedTaskId taskId) = 0;

  virtual bool isOnCurrentThread() const = 0;

  virtual void setExceptionHandler(ExceptionHandler handler) = 0;

  virtual ~AbstractTaskRunner() = default;
};
