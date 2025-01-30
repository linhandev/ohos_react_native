/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "RNOHCorePackage/TurboModules/ReactNativeFeatureFlagsTurboModule.h"
#include <react/featureflags/ReactNativeFeatureFlags.h>

using namespace facebook;

namespace rnoh {
jsi::Value enableBridgelessArchitecture(
    facebook::jsi::Runtime& rt,
    react::TurboModule& turboModule,
    const facebook::jsi::Value* args,
    size_t count) {
  auto self = static_cast<ReactNativeFeatureFlagsTurboModule*>(&turboModule);
  return self->enableBridgelessArchitecture();
}

jsi::Value disableEventLoopOnBridgeless(
    facebook::jsi::Runtime& rt,
    react::TurboModule& turboModule,
    const facebook::jsi::Value* args,
    size_t count) {
  auto self = static_cast<ReactNativeFeatureFlagsTurboModule*>(&turboModule);
  return self->disableEventLoopOnBridgeless();
}

ReactNativeFeatureFlagsTurboModule::ReactNativeFeatureFlagsTurboModule(
    const TurboModule::Context ctx,
    const std::string name)
    : rnoh::TurboModule(ctx, name) {
  methodMap_ = {
      {"enableBridgelessArchitecture", {0, rnoh::enableBridgelessArchitecture}},
      {"disableEventLoopOnBridgeless", {0, rnoh::disableEventLoopOnBridgeless}},
  };
}

bool ReactNativeFeatureFlagsTurboModule::enableBridgelessArchitecture() {
  return react::ReactNativeFeatureFlags::enableBridgelessArchitecture();
}

bool ReactNativeFeatureFlagsTurboModule::disableEventLoopOnBridgeless() {
  return react::ReactNativeFeatureFlags::disableEventLoopOnBridgeless();
}

} // namespace rnoh