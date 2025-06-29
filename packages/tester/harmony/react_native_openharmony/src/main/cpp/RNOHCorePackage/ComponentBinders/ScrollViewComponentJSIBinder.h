/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include "RNOHCorePackage/ComponentBinders/ViewComponentJSIBinder.h"

namespace rnoh {
class ScrollViewComponentJSIBinder : public ViewComponentJSIBinder {
 protected:
  facebook::jsi::Object createNativeProps(facebook::jsi::Runtime& rt) override {
    auto object = ViewComponentJSIBinder::createNativeProps(rt);
    object.setProperty(rt, "scrollEnabled", "boolean");
    object.setProperty(rt, "showsHorizontalScrollIndicator", "boolean");
    object.setProperty(rt, "showsVerticalScrollIndicator", "boolean");
    object.setProperty(rt, "persistentScrollbar", "boolean");
    object.setProperty(rt, "horizontal", "boolean");
    object.setProperty(rt, "contentOffset", "Object");
    object.setProperty(rt, "indicatorStyle", "number");
    object.setProperty(rt, "alwaysBounceHorizontal", "boolean");
    object.setProperty(rt, "alwaysBounceVertical", "boolean");
    object.setProperty(rt, "bounces", "boolean");
    object.setProperty(rt, "decelerationRate", "number");
    object.setProperty(rt, "scrollEventThrottle", "number");
    object.setProperty(rt, "snapToInterval", "number");
    object.setProperty(rt, "snapToOffsets", "number[]");
    object.setProperty(rt, "snapToStart", "boolean");
    object.setProperty(rt, "snapToEnd", "boolean");
    object.setProperty(rt, "pagingEnabled", "boolean");
    object.setProperty(rt, "snapToAlignment", "ScrollViewSnapToAlignment");
    object.setProperty(rt, "disableIntervalMomentum", true);
    object.setProperty(rt, "inverted", "boolean");
    object.setProperty(rt, "maintainVisibleContentPosition", "Object");
    object.setProperty(rt, "scrollToOverflowEnabled", "boolean");
    object.setProperty(rt, "nestedScrollEnabled", "boolean");
    object.setProperty(rt, "overScrollMode", "string");
    object.setProperty(rt, "endFillColor", "Color");
    object.setProperty(rt, "centerContent", "boolean");
    object.setProperty(rt, "__keyboardAvoidingViewBottomHeight", true);
    return object;
  }

  facebook::jsi::Object createBubblingEventTypes(
      facebook::jsi::Runtime& rt) override {
    return facebook::jsi::Object(rt);
  }

  facebook::jsi::Object createDirectEventTypes(
      facebook::jsi::Runtime& rt) override {
    facebook::jsi::Object events =
        ViewComponentJSIBinder::createDirectEventTypes(rt);

    events.setProperty(rt, "topScroll", createDirectEvent(rt, "onScroll"));
    events.setProperty(
        rt, "topScrollBeginDrag", createDirectEvent(rt, "onScrollBeginDrag"));
    events.setProperty(
        rt, "topScrollEndDrag", createDirectEvent(rt, "onScrollEndDrag"));
    events.setProperty(
        rt,
        "topMomentumScrollBegin",
        createDirectEvent(rt, "onMomentumScrollBegin"));
    events.setProperty(
        rt,
        "topMomentumScrollEnd",
        createDirectEvent(rt, "onMomentumScrollEnd"));

    return events;
  }
};
} // namespace rnoh