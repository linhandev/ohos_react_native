/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "EventBeat.h"
#include "react/renderer/runtimescheduler/RuntimeScheduler.h"

namespace rnoh {

EventBeat::EventBeat(
    std::shared_ptr<facebook::react::EventBeat::OwnerBox> ownerBox,
    facebook::react::RuntimeScheduler& runtimeScheduler,
    UITicker::Shared uiTicker)
    : facebook::react::EventBeat(std::move(ownerBox), runtimeScheduler),
      m_uiTicker(std::move(uiTicker)) {}

EventBeat::~EventBeat() {
  if (m_unsubscribeUITickerListener != nullptr) {
    m_unsubscribeUITickerListener();
  }
}

void EventBeat::request() const {
  facebook::react::EventBeat::request();
  std::lock_guard lock(m_unsubscribeUITickerListenerMtx);
  if (m_unsubscribeUITickerListener != nullptr) {
    return;
  }
  m_unsubscribeUITickerListener =
      m_uiTicker->subscribe([this](UITicker::Timestamp timestamp) {
        this->induce();
        auto lock = std::lock_guard(m_unsubscribeUITickerListenerMtx);
        if (m_unsubscribeUITickerListener != nullptr) {
          m_unsubscribeUITickerListener();
          m_unsubscribeUITickerListener = nullptr;
        }
      });
}

} // namespace rnoh