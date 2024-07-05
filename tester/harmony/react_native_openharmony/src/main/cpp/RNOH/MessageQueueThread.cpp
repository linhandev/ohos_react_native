#include "RNOH/MessageQueueThread.h"
#include <react/renderer/debug/SystraceSection.h>

using namespace rnoh;

MessageQueueThread::MessageQueueThread(
    std::shared_ptr<TaskExecutor> const& taskExecutor)
    : taskExecutor(taskExecutor) {}

MessageQueueThread::~MessageQueueThread(){};

void MessageQueueThread::runOnQueue(std::function<void()>&& func) {
  facebook::react::SystraceSection s("#RNOH::MessageQueueThread::runOnQueue");
  taskExecutor->runTask(TaskThread::JS, std::move(func));
}

void MessageQueueThread::runOnQueueSync(std::function<void()>&& func) {
  facebook::react::SystraceSection s(
      "#RNOH::MessageQueueThread::runOnQueueSync");
  taskExecutor->runSyncTask(TaskThread::JS, std::move(func));
}

void MessageQueueThread::quitSynchronous() {
  // TODO!
}
