/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "UIInputEventHandler.h"

#include <arkui/ui_input_event.h>
#include <glog/logging.h>
#include "RNOH/RNOHError.h"
#include "RNOH/arkui/NativeNodeApi.h"

namespace rnoh {

static void receiveEvent(ArkUI_NodeEvent* event) {
  try {
    auto eventType = OH_ArkUI_NodeEvent_GetEventType(event);
    auto target = static_cast<UIInputEventHandler*>(
        OH_ArkUI_NodeEvent_GetUserData(event));

    if (eventType == ArkUI_NodeEventType::NODE_TOUCH_EVENT) {
      auto inputEvent = OH_ArkUI_NodeEvent_GetInputEvent(event);
      if (inputEvent == nullptr ||
          OH_ArkUI_UIInputEvent_GetType(inputEvent) !=
              ArkUI_UIInputEvent_Type::ARKUI_UIINPUTEVENT_TYPE_TOUCH) {
        return;
      }

      target->onTouchEvent(inputEvent);
    } else if (eventType == ArkUI_NodeEventType::NODE_ON_TOUCH_INTERCEPT) {
      auto inputEvent = OH_ArkUI_NodeEvent_GetInputEvent(event);
      if (inputEvent == nullptr ||
          OH_ArkUI_UIInputEvent_GetType(inputEvent) !=
              ArkUI_UIInputEvent_Type::ARKUI_UIINPUTEVENT_TYPE_TOUCH) {
        return;
      }

      target->onTouchIntercept(inputEvent);
    }
  } catch (std::exception& e) {
    LOG(ERROR) << e.what();
  }
}

UIInputEventHandler::UIInputEventHandler(ArkUINode& node) : m_node(node) {
  auto nativeHandle = node.getArkUINodeHandle();

  NativeNodeApi::getInstance()->addNodeEventReceiver(
      nativeHandle, receiveEvent);
  NativeNodeApi::getInstance()->registerNodeEvent(
      nativeHandle, NODE_TOUCH_EVENT, NODE_TOUCH_EVENT, this);
  NativeNodeApi::getInstance()->registerNodeEvent(
      nativeHandle, NODE_ON_TOUCH_INTERCEPT, NODE_ON_TOUCH_INTERCEPT, this);
}

UIInputEventHandler::~UIInputEventHandler() noexcept {
  // Unregister the touch event handler
  NativeNodeApi::getInstance()->unregisterNodeEvent(
      m_node.getArkUINodeHandle(), NODE_TOUCH_EVENT);
  NativeNodeApi::getInstance()->unregisterNodeEvent(
      m_node.getArkUINodeHandle(), NODE_ON_TOUCH_INTERCEPT);
  NativeNodeApi::getInstance()->removeNodeEventReceiver(
      m_node.getArkUINodeHandle(), receiveEvent);
}

} // namespace rnoh
