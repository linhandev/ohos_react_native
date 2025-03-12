/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "RNOHCorePackage/TurboModules/MicrotasksTurboModule.h"

using namespace facebook;

namespace rnoh {
jsi::Value queueMicrotask(
    facebook::jsi::Runtime& rt,
    react::TurboModule& turboModule,
    const facebook::jsi::Value* args,
    size_t count) {
  rt.queueMicrotask(args[0].getObject(rt).asFunction(rt));
  return facebook::jsi::Value::undefined();
}
void queueMicrotask(jsi::Runtime& runtime, jsi::Function callback);

MicrotasksTurboModule::MicrotasksTurboModule(
    const TurboModule::Context ctx,
    const std::string name)
    : rnoh::TurboModule(ctx, name) {
  methodMap_ = {{"queueMicrotask", {1, rnoh::queueMicrotask}}};
}

} // namespace rnoh