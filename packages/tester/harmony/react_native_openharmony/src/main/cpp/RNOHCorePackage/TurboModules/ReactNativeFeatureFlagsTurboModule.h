/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <ReactCommon/TurboModule.h>
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT ReactNativeFeatureFlagsTurboModule : public TurboModule {
 public:
  ReactNativeFeatureFlagsTurboModule(
      const TurboModule::Context ctx,
      const std::string name);

  bool enableBridgelessArchitecture();
  bool disableEventLoopOnBridgeless();
};

} // namespace rnoh
