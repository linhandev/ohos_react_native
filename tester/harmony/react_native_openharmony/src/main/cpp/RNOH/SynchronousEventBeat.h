#pragma once
#include <ReactCommon/RuntimeExecutor.h>
#include <react/renderer/core/EventBeat.h>
#include <react/renderer/runtimescheduler/RuntimeScheduler.h>
#include "RNOH/TaskExecutor/TaskExecutor.h"
#include "RNOH/UITicker.h"

namespace rnoh {
class SynchronousEventBeat final : public facebook::react::EventBeat {
  using RuntimeExecutor = facebook::react::RuntimeExecutor;
  using SharedRuntimeScheduler =
      std::shared_ptr<facebook::react::RuntimeScheduler>;

 public:
  SynchronousEventBeat(
      SharedOwnerBox ownerBox,
      SharedRuntimeScheduler runtimeScheduler,
      TaskExecutor::Shared taskExecutor);

 protected:
  void induce() const override;

 private:
  void lockExecutorAndBeat() const;

  SharedRuntimeScheduler m_runtimeScheduler;
  TaskExecutor::Shared m_taskExecutor;
};

} // namespace rnoh