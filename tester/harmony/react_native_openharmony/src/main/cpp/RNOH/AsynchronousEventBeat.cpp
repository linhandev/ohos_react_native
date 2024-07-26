#include "AsynchronousEventBeat.h"

namespace rnoh {

AsynchronousEventBeat::AsynchronousEventBeat(int id,
    SharedOwnerBox ownerBox,
    RuntimeExecutor runtimeExecutor,
    UITicker::Shared const& uiTicker)
    : EventBeat(std::move(ownerBox)), m_runtimeExecutor(runtimeExecutor) {
  m_unsubscribeUITickerListener = uiTicker->subscribe(
      [this](long long timestamp) { this->induce(); });
}

AsynchronousEventBeat::~AsynchronousEventBeat() {
  if (m_unsubscribeUITickerListener) {
    m_unsubscribeUITickerListener();
  }
}

void AsynchronousEventBeat::induce() const {
  if (!isRequested_ || m_isBeatScheduled) {
    return;
  }

  isRequested_ = false;

  auto weakOwner = ownerBox_->owner;

  m_isBeatScheduled = true;

  m_runtimeExecutor([this, weakOwner](facebook::jsi::Runtime& runtime) {
    m_isBeatScheduled = false;

    auto owner = weakOwner.lock();
    if (!owner) {
      return;
    }

    if (beatCallback_) {
      beatCallback_(runtime);
    }
  });
}

} // namespace rnoh