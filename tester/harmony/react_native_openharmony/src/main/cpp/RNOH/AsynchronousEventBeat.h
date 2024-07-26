#pragma once

#include <ReactCommon/RuntimeExecutor.h>
#include <react/renderer/core/EventBeat.h>
#include "RNOH/UITicker.h"

namespace rnoh {

class AsynchronousEventBeat final : public facebook::react::EventBeat {
  using RuntimeExecutor = facebook::react::RuntimeExecutor;

 public:
  AsynchronousEventBeat(int id,
      SharedOwnerBox ownerBox,
      RuntimeExecutor runtimeExecutor,
      UITicker::Shared const& uiTicker);

  ~AsynchronousEventBeat();

 protected:
  void induce() const override;

 private:
  RuntimeExecutor m_runtimeExecutor;
  std::function<void()> m_unsubscribeUITickerListener;
  mutable std::atomic<bool> m_isBeatScheduled{false};
};

} // namespace rnoh