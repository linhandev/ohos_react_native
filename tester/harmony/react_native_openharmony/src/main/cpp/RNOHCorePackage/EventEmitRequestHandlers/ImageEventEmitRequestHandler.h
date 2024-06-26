#pragma once
#include <react/renderer/components/image/ImageEventEmitter.h>
#include "RNOH/ArkJS.h"
#include "RNOH/EventEmitRequestHandler.h"

namespace rnoh {

class ImageEventEmitRequestHandler : public EventEmitRequestHandler {
  struct ImageLoadEventSourceObject {
    float width;
    float height;
    std::string uri;
  };

  ImageLoadEventSourceObject getImageLoadEventSourceObject(
      ArkJS& arkJS,
      napi_value eventObject) {
    auto width =
        (float)(arkJS.getDouble(arkJS.getObjectProperty(eventObject, "width")));
    auto height = (float)(arkJS.getDouble(
        arkJS.getObjectProperty(eventObject, "height")));
    auto uri = arkJS.getString(arkJS.getObjectProperty(eventObject, "uri"));
    return {width, height, uri};
  }

  void handleEvent(EventEmitRequestHandler::Context const& ctx) override {
    if (ctx.eventName != "loadStart" && ctx.eventName != "load" &&
        ctx.eventName != "error" && ctx.eventName != "loadEnd") {
      return;
    }

    auto eventEmitter =
        ctx.shadowViewRegistry
            ->getEventEmitter<facebook::react::ImageEventEmitter>(ctx.tag);
    if (eventEmitter == nullptr) {
      return;
    }

    ArkJS arkJS(ctx.env);
    if (ctx.eventName == "loadStart") {
      eventEmitter->onLoadStart();
    } else if (ctx.eventName == "load") {
      auto imageLoadEventSourceObject =
          getImageLoadEventSourceObject(arkJS, ctx.payload);
      eventEmitter->dispatchEvent("load", [=](facebook::jsi::Runtime& runtime) {
        auto payload = facebook::jsi::Object(runtime);
        auto source = facebook::jsi::Object(runtime);
        source.setProperty(runtime, "width", imageLoadEventSourceObject.width);
        source.setProperty(
            runtime, "height", imageLoadEventSourceObject.height);
        source.setProperty(
            runtime, "uri", imageLoadEventSourceObject.uri.c_str());
        payload.setProperty(runtime, "source", source);
        return payload;
      });
    } else if (ctx.eventName == "loadEnd") {
      eventEmitter->onLoadEnd();
    } else if (ctx.eventName == "error") {
      auto message = arkJS.getString(ctx.payload);
      eventEmitter->dispatchEvent(
          "error", [=](facebook::jsi::Runtime& runtime) {
            auto payload = facebook::jsi::Object(runtime);
            payload.setProperty(runtime, "error", message);
            return payload;
          });
    }
  }
};

} // namespace rnoh