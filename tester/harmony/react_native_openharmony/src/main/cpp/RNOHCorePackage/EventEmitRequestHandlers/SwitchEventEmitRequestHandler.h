#pragma once
#include <react/renderer/components/rncore/EventEmitters.h>
#include "RNOH/ArkJS.h"
#include "RNOH/EventEmitRequestHandler.h"

namespace rnoh {

facebook::react::SwitchEventEmitter::OnChange convertSwitchEvent(
    ArkJS& arkJS,
    napi_value eventObject) {
  auto value = arkJS.getBoolean(arkJS.getObjectProperty(eventObject, "value"));
  auto target =
      arkJS.getInteger(arkJS.getObjectProperty(eventObject, "target"));

  return {value, target};
}

class SwitchEventEmitRequestHandler : public EventEmitRequestHandler {
  void handleEvent(EventEmitRequestHandler::Context const& ctx) override {
    if (ctx.eventName != "onChange") {
      return;
    }

    auto eventEmitter =
        ctx.shadowViewRegistry
            ->getEventEmitter<facebook::react::SwitchEventEmitter>(ctx.tag);
    if (eventEmitter == nullptr) {
      return;
    }

    ArkJS arkJS(ctx.env);
    auto event = convertSwitchEvent(arkJS, ctx.payload);
    eventEmitter->onChange(event);
  }
};

} // namespace rnoh