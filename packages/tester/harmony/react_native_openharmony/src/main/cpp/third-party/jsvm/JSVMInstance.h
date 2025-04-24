/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <cxxreact/MessageQueueThread.h>
#include <react/config/ReactNativeConfig.h>
#include <react/runtime/JSRuntimeFactory.h>

using namespace facebook::react;

namespace jsvm {

class JSVMInstance {
 public:
  static std::unique_ptr<JSRuntime> createJSRuntime(
      std::shared_ptr<const ReactNativeConfig> reactNativeConfig,
      std::shared_ptr<MessageQueueThread> msgQueueThread,
      bool allocInOldGenBeforeTTI) noexcept;
};

} // namespace jsvm
