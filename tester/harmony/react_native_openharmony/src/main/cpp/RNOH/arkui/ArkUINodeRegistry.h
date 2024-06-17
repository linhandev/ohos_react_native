#pragma once

#include <arkui/native_node.h>
#include <functional>
#include <unordered_map>
#include "RNOH/ArkTSBridge.h"

namespace rnoh {

class ArkUINode;

using EventArgs = ArkUI_NumberValue[MAX_COMPONENT_EVENT_ARG_NUM];

class TouchEventHandler {
 public:
  virtual void onTouchEvent(ArkUI_UIInputEvent* event) = 0;
  virtual ~TouchEventHandler() = default;
};

class ArkUINodeRegistry {
  static std::unique_ptr<ArkUINodeRegistry> instance;
  static std::function<void(std::exception_ptr)> ON_ERROR;

 public:
  static bool isInitialized();
  static void initialize(std::function<void(std::exception_ptr)> onError);
  static ArkUINodeRegistry& getInstance();

  void registerNode(ArkUINode* node);
  void unregisterNode(ArkUINode* node);

  void registerTouchHandler(
      ArkUINode* node,
      TouchEventHandler* touchEventHandler);
  void unregisterTouchHandler(ArkUINode* node);

 private:
  ArkUINodeRegistry();

  void receiveEvent(ArkUI_NodeEvent* event);

  std::unordered_map<ArkUI_NodeHandle, ArkUINode*> m_nodeByHandle;
  std::unordered_map<ArkUI_NodeHandle, TouchEventHandler*>
      m_touchHandlerByNodeHandle;
};

} // namespace rnoh