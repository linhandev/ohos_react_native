#pragma once

#include <ReactCommon/RuntimeExecutor.h>
#include <react/renderer/core/EventBeat.h>
#include "RNOH/UITicker.h"

namespace rnoh {

class AsynchronousEventBeat final : public facebook::react::EventBeat {
  using RuntimeExecutor = facebook::react::RuntimeExecutor;

 public:
  AsynchronousEventBeat(
      SharedOwnerBox ownerBox,
      RuntimeExecutor runtimeExecutor,
      UITicker::Shared uiTicker);

  ~AsynchronousEventBeat();

  void request() const override;

 protected:
  void induce() const override;

 private:
  RuntimeExecutor m_runtimeExecutor;
  mutable std::function<void()> m_unsubscribeUITickerListener = nullptr;
  mutable std::mutex m_unsubscribeUITickerListenerMtx;
  mutable std::atomic<bool> m_isBeatScheduled{false};
  UITicker::Shared m_uiTicker;
};

} // namespace rnoh