#pragma once

#include <arkui/native_node.h>
#include <functional>
#include <unordered_map>
#include "RNOH/ArkTSBridge.h"

namespace rnoh {

class ArkUINode;

using EventArgs = ArkUI_NumberValue[MAX_COMPONENT_EVENT_ARG_NUM];

/**
 * @api
 * @deprecated Use UIInputEventHandler instead (latestRNOHVersion: 0.72.27).
 */
class TouchEventHandler {
 public:
  virtual void onTouchEvent(ArkUI_UIInputEvent* event) = 0;
  virtual ~TouchEventHandler() = default;
};

/**
 * @api
 * @deprecated Use UIInputEventHandler instead for touch events, node events
 * should be handled by `ArkUINode`s automatically (latestRNOHVersion: 0.72.27).
 */
class ArkUINodeRegistry {
  static std::unique_ptr<ArkUINodeRegistry> instance;

 public:
  static void initialize(ArkTSBridge::Shared arkTSBridge);
  static ArkUINodeRegistry& getInstance();

  void registerTouchHandler(
      ArkUINode* node,
      TouchEventHandler* touchEventHandler);
  void unregisterTouchHandler(ArkUINode* node);

 private:
  ArkUINodeRegistry(ArkTSBridge::Shared arkTSBridge);

  void receiveEvent(ArkUI_NodeEvent* event);

  std::unordered_map<ArkUI_NodeHandle, TouchEventHandler*>
      m_touchHandlerByNodeHandle;
  ArkTSBridge::Shared m_arkTSBridge;
};

} // namespace rnoh