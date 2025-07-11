/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include "RNOH/UIManagerModule.h"
#include "RNOHCorePackage/ComponentBinders/ViewComponentJSIBinder.h"

namespace rnoh {

class ModalHostViewJSIBinder : public ViewComponentJSIBinder {
 protected:
  facebook::jsi::Object createDirectEventTypes(
      facebook::jsi::Runtime& rt) override {
    auto events = ViewComponentJSIBinder::createDirectEventTypes(rt);
    events.setProperty(
        rt, "topRequestClose", createDirectEvent(rt, "onRequestClose"));
    events.setProperty(rt, "topShow", createDirectEvent(rt, "onShow"));
    events.setProperty(
        rt,
        "topOrientationChange",
        createDirectEvent(rt, "onOrientationChange"));

    return events;
  }

  facebook::jsi::Object createNativeProps(facebook::jsi::Runtime& rt) override {
    auto nativeProps = ViewComponentJSIBinder::createNativeProps(rt);
    nativeProps.setProperty(rt, "transparent", "boolean");
    nativeProps.setProperty(rt, "visible", "boolean");
    nativeProps.setProperty(rt, "identifier", "number");
    nativeProps.setProperty(rt, "animationType", "string");
    return nativeProps;
  }
};

} // namespace rnoh