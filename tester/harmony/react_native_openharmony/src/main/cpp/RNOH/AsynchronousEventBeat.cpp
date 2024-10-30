#include "AsynchronousEventBeat.h"

namespace rnoh {

AsynchronousEventBeat::AsynchronousEventBeat(
    SharedOwnerBox ownerBox,
    RuntimeExecutor runtimeExecutor,
    UITicker::Shared uiTicker)
    : EventBeat(std::move(ownerBox)),
      m_runtimeExecutor(runtimeExecutor),
      m_uiTicker(std::move(uiTicker)) {}

AsynchronousEventBeat::~AsynchronousEventBeat() {
  if (m_unsubscribeUITickerListener != nullptr) {
    m_unsubscribeUITickerListener();
  }
}

void AsynchronousEventBeat::request() const {
  EventBeat::request();
  std::lock_guard lock(m_unsubscribeUITickerListenerMtx);
  if (m_unsubscribeUITickerListener == nullptr) {
    m_unsubscribeUITickerListener = m_uiTicker->subscribe(
        [this](UITicker::Timestamp timestamp) { this->induce(); });
  }
}

void AsynchronousEventBeat::induce() const {
  if (!isRequested_ || m_isBeatScheduled) {
    return;
  }
  isRequested_ = false;
  m_isBeatScheduled = true;
  auto weakOwner = ownerBox_->owner;
  m_runtimeExecutor([this, weakOwner](facebook::jsi::Runtime& runtime) {
    m_isBeatScheduled = false;
    auto owner = weakOwner.lock();
    if (!owner) {
      return;
    }
    if (beatCallback_) {
      beatCallback_(runtime);
    }
    {
      auto lock = std::lock_guard(m_unsubscribeUITickerListenerMtx);
      if (m_unsubscribeUITickerListener != nullptr) {
        m_unsubscribeUITickerListener();
        m_unsubscribeUITickerListener = nullptr;
      }
    }
  });
}

} // namespace rnoh