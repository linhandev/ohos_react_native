/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "NativeNodeApi.h"
#include <glog/logging.h>

namespace rnoh {

ArkUI_NativeNodeAPI_1* NativeNodeApi::getInstance() {
  static ArkUI_NativeNodeAPI_1* INSTANCE = nullptr;
  if (INSTANCE == nullptr) {
    OH_ArkUI_GetModuleInterface(
        ARKUI_NATIVE_NODE, ArkUI_NativeNodeAPI_1, INSTANCE);
    if (INSTANCE == nullptr) {
      LOG(FATAL) << "Failed to get native node API instance.";
    }
  }
  return INSTANCE;
}

} // namespace rnoh