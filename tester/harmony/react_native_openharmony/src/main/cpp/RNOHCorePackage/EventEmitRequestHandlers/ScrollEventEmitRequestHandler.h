#pragma once
#include <react/renderer/components/scrollview/ScrollViewEventEmitter.h>
#include "RNOH/ArkJS.h"
#include "RNOH/EventEmitRequestHandler.h"

namespace rnoh {

enum ScrollEventType {
  BEGIN_DRAG = 0,
  END_DRAG = 1,
  BEGIN_MOMENTUM = 2,
  END_MOMENTUM = 3,
  SCROLLING = 4,
  UNSUPPORTED = 5
};

facebook::react::ScrollViewMetrics convertScrollEvent(
    ArkJS& arkJS,
    napi_value eventObject) {
  auto arkContentSize = arkJS.getObjectProperty(eventObject, "contentSize");
  facebook::react::Size contentSize = {
      (float)arkJS.getDouble(arkJS.getObjectProperty(arkContentSize, "width")),
      (float)arkJS.getDouble(
          arkJS.getObjectProperty(arkContentSize, "height"))};

  auto arkContentOffset = arkJS.getObjectProperty(eventObject, "contentOffset");
  facebook::react::Point contentOffset = {
      (float)arkJS.getDouble(arkJS.getObjectProperty(arkContentOffset, "x")),
      (float)arkJS.getDouble(arkJS.getObjectProperty(arkContentOffset, "y"))};

  auto arkContainerSize = arkJS.getObjectProperty(eventObject, "containerSize");
  facebook::react::Size containerSize = {
      (float)arkJS.getDouble(
          arkJS.getObjectProperty(arkContainerSize, "width")),
      (float)arkJS.getDouble(
          arkJS.getObjectProperty(arkContainerSize, "height"))};

  float zoomScale =
      (float)arkJS.getDouble(arkJS.getObjectProperty(eventObject, "zoomScale"));
  bool responderIgnoreScroll = (bool)arkJS.getBoolean(
      arkJS.getObjectProperty(eventObject, "responderIgnoreScroll"));

  return {
      contentSize,
      contentOffset,
      {},
      containerSize,
      zoomScale,
      responderIgnoreScroll};
}

ScrollEventType getScrollEventType(std::string const& eventType) {
  if (eventType == "onScrollBeginDrag") {
    return ScrollEventType::BEGIN_DRAG;
  } else if (eventType == "onScrollEndDrag") {
    return ScrollEventType::END_DRAG;
  } else if (eventType == "onMomentumScrollBegin") {
    return ScrollEventType::BEGIN_MOMENTUM;
  } else if (eventType == "onMomentumScrollEnd") {
    return ScrollEventType::END_MOMENTUM;
  } else if (eventType == "onScroll") {
    return ScrollEventType::SCROLLING;
  } else {
    return ScrollEventType::UNSUPPORTED;
  }
}

class ScrollEventEmitRequestHandler : public EventEmitRequestHandler {
  void handleEvent(EventEmitRequestHandler::Context const& ctx) override {
    auto eventType = getScrollEventType(ctx.eventName);
    if (eventType == ScrollEventType::UNSUPPORTED) {
      return;
    }

    auto eventEmitter =
        ctx.shadowViewRegistry
            ->getEventEmitter<facebook::react::ScrollViewEventEmitter>(ctx.tag);
    if (eventEmitter == nullptr) {
      return;
    }

    ArkJS arkJS(ctx.env);
    auto event = convertScrollEvent(arkJS, ctx.payload);

    switch (eventType) {
      case ScrollEventType::BEGIN_DRAG:
        eventEmitter->onScrollBeginDrag(event);
        break;
      case ScrollEventType::END_DRAG:
        eventEmitter->onScrollEndDrag(event);
        break;
      case ScrollEventType::BEGIN_MOMENTUM:
        eventEmitter->onMomentumScrollBegin(event);
        break;
      case ScrollEventType::END_MOMENTUM:
        eventEmitter->onMomentumScrollEnd(event);
        break;
      case ScrollEventType::SCROLLING:
        eventEmitter->onScroll(event);
        break;
      default:
        break;
    }
  }
};

} // namespace rnoh