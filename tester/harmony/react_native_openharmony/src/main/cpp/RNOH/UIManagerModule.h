/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once
#include <jsi/jsi.h>
#include <unordered_map>

namespace rnoh {
/**
 * @internal
 */
class ComponentJSIBinder {
 public:
  virtual facebook::jsi::Object createBindings(facebook::jsi::Runtime&) = 0;
};

/**
 * @internal
 */
using ComponentJSIBinderByString =
    std::unordered_map<std::string, std::shared_ptr<ComponentJSIBinder>>;

} // namespace rnoh
