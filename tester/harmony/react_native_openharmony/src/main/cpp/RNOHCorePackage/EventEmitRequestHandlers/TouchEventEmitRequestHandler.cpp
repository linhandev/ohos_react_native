#include "TouchEventEmitRequestHandler.h"
#include <glog/logging.h>
#include <react/renderer/components/view/TouchEventEmitter.h>

using namespace facebook;

namespace rnoh {

void TouchEventEmitRequestHandler::handleEvent(
    TouchEventEmitRequestHandler::Context const& ctx) {
  if (ctx.eventName != "Touch") {
    return;
  }

  ArkJS arkJS(ctx.env);
  auto touchEvent = ctx.payload;

  auto timestampNanos =
      arkJS.getDouble(arkJS.getObjectProperty(touchEvent, "timestamp"));
  // rn expects a timestamp in seconds. We need to convert the timestamp from
  // nanoseconds to miliseconds, use floor to round down and then convert to
  // seconds. RN multiplies it by 1e3 to convert to miliseconds.
  react::Float timestamp = std::floor(timestampNanos / 1e6) / 1e3;

  auto touches = convertTouches(
      arkJS,
      ctx.tag,
      timestamp,
      arkJS.getObjectProperty(touchEvent, "touches"));
  auto changedTouches = convertTouches(
      arkJS,
      ctx.tag,
      timestamp,
      arkJS.getObjectProperty(touchEvent, "changedTouches"));

  auto eventType = (TouchType)(arkJS.getDouble(
      arkJS.getObjectProperty(ctx.payload, "type")));
  bool isTouchEnd =
      eventType == TouchType::UP || eventType == TouchType::CANCEL;

  std::unordered_set<react::Tag> changedTargets;
  for (auto& touch : changedTouches) {
    changedTargets.insert(touch.target);
  }

  for (auto target : changedTargets) {
    auto eventEmitter =
        ctx.shadowViewRegistry->getEventEmitter<react::TouchEventEmitter>(
            target);
    if (!eventEmitter) {
      continue;
    }

    react::TouchEvent event{
        .touches = touches, .changedTouches = changedTouches};

    react::Touches targetTouches;
    for (auto& touch : touches) {
      if (touch.target == target) {
        targetTouches.insert(touch);
      }
    }

    event.targetTouches = std::move(targetTouches);

    switch (eventType) {
      case TouchType::DOWN:
        eventEmitter->onTouchStart(event);
        break;
      case TouchType::UP:
        eventEmitter->onTouchEnd(event);
        break;
      case TouchType::MOVE:
        eventEmitter->onTouchMove(event);
        break;
      case TouchType::CANCEL:
        eventEmitter->onTouchCancel(event);
        break;
      default:
        LOG(FATAL) << "Invalid touch event type received from Ark";
    }
  }
}

facebook::react::Touch TouchEventEmitRequestHandler::convertTouchObject(
    ArkJS& arkJS,
    napi_value touchObject) {
  facebook::react::Tag id =
      arkJS.getDouble(arkJS.getObjectProperty(touchObject, "id"));
  facebook::react::Tag target =
      arkJS.getDouble(arkJS.getObjectProperty(touchObject, "targetTag"));
  facebook::react::Float screenX =
      arkJS.getDouble(arkJS.getObjectProperty(touchObject, "screenX"));
  facebook::react::Float screenY =
      arkJS.getDouble(arkJS.getObjectProperty(touchObject, "screenY"));
  facebook::react::Float pageX =
      arkJS.getDouble(arkJS.getObjectProperty(touchObject, "pageX"));
  facebook::react::Float pageY =
      arkJS.getDouble(arkJS.getObjectProperty(touchObject, "pageY"));
  facebook::react::Float x =
      arkJS.getDouble(arkJS.getObjectProperty(touchObject, "x"));
  facebook::react::Float y =
      arkJS.getDouble(arkJS.getObjectProperty(touchObject, "y"));
  return facebook::react::Touch{
      .pagePoint = {.x = pageX, .y = pageY},
      .offsetPoint = {.x = x, .y = y},
      .screenPoint = {.x = screenX, .y = screenY},
      .identifier = id,
      .target = target,
      .force = 1};
}

facebook::react::Touches TouchEventEmitRequestHandler::convertTouches(
    ArkJS& arkJS,
    facebook::react::Tag tag,
    facebook::react::Float timestamp,
    napi_value touchArray) {
  facebook::react::Touches touches;
  auto arrayLength = arkJS.getArrayLength(touchArray);
  for (int i = 0; i < arrayLength; i++) {
    auto touchObject = arkJS.getArrayElement(touchArray, i);
    auto touch = convertTouchObject(arkJS, touchObject);
    touch.timestamp = timestamp;

    touches.insert(std::move(touch));
  }
  return touches;
}

} // namespace rnoh