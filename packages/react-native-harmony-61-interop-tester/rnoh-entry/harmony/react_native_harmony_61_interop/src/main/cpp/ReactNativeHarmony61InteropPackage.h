/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */
#pragma once

#include <RNOH/Package.h>
#include "RNOH/generated/BaseReactNativeHarmony61InteropPackage.h"

namespace rnoh {

class ReactNativeHarmony61InteropPackage
    : public BaseReactNativeHarmony61InteropPackage {
  using Super = BaseReactNativeHarmony61InteropPackage;

 public:
  ReactNativeHarmony61InteropPackage(Package::Context ctx) : Super(ctx) {}
};
} // namespace rnoh