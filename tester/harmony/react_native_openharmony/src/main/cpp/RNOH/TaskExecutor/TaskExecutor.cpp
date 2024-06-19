#include "TaskExecutor.h"
#include <glog/logging.h>
#include <react/renderer/debug/SystraceSection.h>
#include "NapiTaskRunner.h"
#include "RNOH/RNOHError.h"
#include "ThreadTaskRunner.h"

namespace rnoh {

TaskExecutor::TaskExecutor(napi_env mainEnv, bool shouldEnableBackground) {
  auto mainTaskRunner = std::make_shared<NapiTaskRunner>(mainEnv);
  auto jsTaskRunner = std::make_shared<ThreadTaskRunner>("RNOH_JS");
  auto backgroundExecutor = shouldEnableBackground
      ? std::make_shared<ThreadTaskRunner>("RNOH_BACKGROUND")
      : nullptr;
  m_taskRunners = {mainTaskRunner, jsTaskRunner, backgroundExecutor};
  this->runTask(TaskThread::JS, [this]() {
    this->setTaskThreadPriority(QoS_Level::QOS_USER_INTERACTIVE);
  });
  if (shouldEnableBackground) {
    this->runTask(TaskThread::BACKGROUND, [this]() {
      this->setTaskThreadPriority(QoS_Level::QOS_USER_INTERACTIVE);
    });
  }
}

void TaskExecutor::setTaskThreadPriority(QoS_Level level) {
#ifdef C_API_ARCH
  int ret = OH_QoS_SetThreadQoS(level);
  std::array<char, 16> buffer = {0};
  pthread_getname_np(pthread_self(), buffer.data(), sizeof(buffer));
  DLOG(INFO) << "TaskExecutor::setTaskThreadPriority " << buffer.data()
             << (ret == 0 ? " SUCCESSFUL" : " FAILED");
#else
  DLOG(WARNING)
      << "TaskExecutor::setTaskThreadPriority available only with C-API";
#endif
}

void TaskExecutor::runTask(TaskThread thread, Task&& task) {
  facebook::react::SystraceSection s("#RNOH::TaskExecutor::runTask");
  m_taskRunners[thread]->runAsyncTask(std::move(task));
}

void TaskExecutor::runSyncTask(TaskThread thread, Task&& task) {
  facebook::react::SystraceSection s("#RNOH::TaskExecutor::runSyncTask");
  auto waitsOnThread = m_waitsOnThread[thread];
  if (waitsOnThread.has_value() && isOnTaskThread(waitsOnThread.value())) {
    throw RNOHError("Deadlock detected");
  }
  auto currentThread = getCurrentTaskThread();
  if (currentThread.has_value() && currentThread != thread) {
    m_waitsOnThread[currentThread.value()] = thread;
  }
  std::exception_ptr thrownError;
  m_taskRunners[thread]->runSyncTask([task = std::move(task), &thrownError]() {
    try {
      task();
    } catch (const std::exception& e) {
      thrownError = std::current_exception();
    }
  });
  if (thrownError) {
    std::rethrow_exception(thrownError);
  }
  if (currentThread.has_value()) {
    m_waitsOnThread[currentThread.value()] = std::nullopt;
  }
}

bool TaskExecutor::isOnTaskThread(TaskThread thread) const {
  facebook::react::SystraceSection s("#RNOH::TaskExecutor::isOnTaskThread");
  auto runner = m_taskRunners[thread];
  return runner && runner->isOnCurrentThread();
}

std::optional<TaskThread> TaskExecutor::getCurrentTaskThread() const {
  facebook::react::SystraceSection s(
      "#RNOH::TaskExecutor::getCurrentTaskThread");
  if (isOnTaskThread(TaskThread::MAIN)) {
    return TaskThread::MAIN;
  } else if (isOnTaskThread(TaskThread::JS)) {
    return TaskThread::JS;
  } else if (isOnTaskThread(TaskThread::BACKGROUND)) {
    return TaskThread::BACKGROUND;
  } else {
    return std::nullopt;
  }
}

void TaskExecutor::setExceptionHandler(ExceptionHandler handler) {
  facebook::react::SystraceSection s(
      "#RNOH::TaskExecutor::setExceptionHandler");
  for (auto& taskRunner : m_taskRunners) {
    if (taskRunner) {
      taskRunner->setExceptionHandler(handler);
    }
  }
}

} // namespace rnoh
