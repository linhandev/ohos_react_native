/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <ReactCommon/RuntimeExecutor.h>
#include <react/renderer/core/EventBeat.h>
#include "RNOH/UITicker.h"

namespace rnoh {

class EventBeat final : public facebook::react::EventBeat {
 public:
  EventBeat(
      std::shared_ptr<facebook::react::EventBeat::OwnerBox> ownerBox,
      facebook::react::RuntimeScheduler& runtimeScheduler,
      UITicker::Shared uiTicker);

  ~EventBeat();

  void request() const override;

 private:
  mutable std::function<void()> m_unsubscribeUITickerListener = nullptr;
  mutable std::mutex m_unsubscribeUITickerListenerMtx;
  mutable std::atomic<bool> m_isBeatScheduled{false};
  UITicker::Shared m_uiTicker;
};

} // namespace rnoh