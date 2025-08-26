/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include "RNOH/TurboModule.h"

namespace rnoh {

class JSI_EXPORT IdleCallbacksCxxTurboModule : public TurboModule {
 public:
  using CallbackHandle = facebook::jsi::Object;

  struct RequestIdleCallbackOptions {
    std::optional<double> timeout;
  };

  IdleCallbacksCxxTurboModule(
      const TurboModule::Context ctx,
      const std::string name);

  IdleCallbacksCxxTurboModule::CallbackHandle requestIdleCallback(
      facebook::jsi::Runtime& runtime,
      facebook::jsi::Function userCallback,
      std::optional<RequestIdleCallbackOptions> options);

  void cancelIdleCallback(
      facebook::jsi::Runtime& runtime,
      facebook::jsi::Object handle);
};

} // namespace rnoh
