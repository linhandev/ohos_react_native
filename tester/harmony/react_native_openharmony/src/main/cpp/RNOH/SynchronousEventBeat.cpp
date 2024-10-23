#include "SynchronousEventBeat.h"
#include <cxxreact/SystraceSection.h>

namespace rnoh {

SynchronousEventBeat::SynchronousEventBeat(
    SharedOwnerBox ownerBox,
    SharedRuntimeScheduler runtimeScheduler,
    TaskExecutor::Shared taskExecutor)
    : EventBeat(std::move(ownerBox)),
      m_runtimeScheduler(std::move(runtimeScheduler)),
      m_taskExecutor(std::move(taskExecutor)) {}

void SynchronousEventBeat::induce() const {
  if (!isRequested_) {
    return;
  }

  if (m_taskExecutor->isOnTaskThread(TaskThread::JS)) {
    lockExecutorAndBeat();
  } else {
    m_runtimeScheduler->scheduleWork([this](auto& runtime) {
      if (!isRequested_) {
        return;
      }
      beat(runtime);
    });
  }
}

void SynchronousEventBeat::lockExecutorAndBeat() const {
  if (!isRequested_) {
    return;
  }

  m_runtimeScheduler->executeNowOnTheSameThread(
      [this](auto& runtime) { beat(runtime); });
}

} // namespace rnoh