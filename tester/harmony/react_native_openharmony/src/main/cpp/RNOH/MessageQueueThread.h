#pragma once

#include <cxxreact/MessageQueueThread.h>
#include <condition_variable>
#include <functional>
#include <mutex>
#include <queue>
#include <thread>

#include "RNOH/TaskExecutor/TaskExecutor.h"

namespace rnoh {

class MessageQueueThread : public facebook::react::MessageQueueThread {
 public:
  MessageQueueThread(TaskExecutor::Shared const& taskExecutor);
  virtual ~MessageQueueThread();

  void runOnQueue(std::function<void()>&& func) override;

  void runOnQueueSync(std::function<void()>&& func) override;

  void quitSynchronous() override;

 private:
  TaskExecutor::Shared taskExecutor;
};

} // namespace rnoh