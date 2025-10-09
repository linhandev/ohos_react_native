/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */
#pragma once

#include <RNOH/Package.h>
#include "RNOH/generated/BaseReactNativeHarmony61InteropPackage.h"
#include "components/masked_view/MaskedViewComponentInstance.h"

namespace rnoh {

class ReactNativeHarmony61InteropPackage
    : public BaseReactNativeHarmony61InteropPackage {
  using Super = BaseReactNativeHarmony61InteropPackage;

 public:
  ReactNativeHarmony61InteropPackage(Package::Context ctx) : Super(ctx) {}

  ComponentInstanceFactoryDelegate::Shared
  createComponentInstanceFactoryDelegate() override {
    class InteropComponentInstanceFactoryDelegate
        : public ComponentInstanceFactoryDelegate {
     public:
      using ComponentInstanceFactoryDelegate::ComponentInstanceFactoryDelegate;

      ComponentInstance::Shared create(
          ComponentInstance::Context ctx) override {
        if (ctx.componentName == "RNMaskedView") {
          return std::make_shared<MaskedViewComponentInstance>(std::move(ctx));
        }
        return nullptr;
      }
    };
    return std::make_shared<InteropComponentInstanceFactoryDelegate>();
  }
};
} // namespace rnoh