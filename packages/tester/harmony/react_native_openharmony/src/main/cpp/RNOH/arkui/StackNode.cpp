/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "StackNode.h"

#include <glog/logging.h>
#include <memory>
#include "NativeNodeApi.h"

namespace rnoh {

StackNode::StackNode()
    : ArkUINode(NativeNodeApi::getInstance()->createNode(
          ArkUI_NodeType::ARKUI_NODE_STACK)),
      m_stackNodeDelegate(nullptr) {
  registerNodeEvent(NODE_ON_CLICK);
  registerNodeEvent(NODE_ON_HOVER);
}

void StackNode::insertChild(ArkUINode& child, std::size_t index) {
  maybeThrow(NativeNodeApi::getInstance()->insertChildAt(
      m_nodeHandle, child.getArkUINodeHandle(), static_cast<int32_t>(index)));
}

void StackNode::addChild(ArkUINode& child) {
  maybeThrow(NativeNodeApi::getInstance()->addChild(
      m_nodeHandle, child.getArkUINodeHandle()));
}

void StackNode::removeChild(ArkUINode& child) {
  maybeThrow(NativeNodeApi::getInstance()->removeChild(
      m_nodeHandle, child.getArkUINodeHandle()));
}

void StackNode::setStackNodeDelegate(StackNodeDelegate* stackNodeDelegate) {
  m_stackNodeDelegate = stackNodeDelegate;
}

void StackNode::onNodeEvent(
    ArkUI_NodeEventType eventType,
    EventArgs& eventArgs) {
  ArkUINode::onNodeEvent(eventType, eventArgs);
  if (eventType == ArkUI_NodeEventType::NODE_ON_CLICK &&
      eventArgs[3].i32 != UI_INPUT_EVENT_SOURCE_TYPE_TOUCH_SCREEN &&
      eventArgs[3].i32 != UI_INPUT_EVENT_SOURCE_TYPE_MOUSE) {
    onClick();
  }
  if (eventType == ArkUI_NodeEventType::NODE_ON_HOVER) {
    if (m_stackNodeDelegate != nullptr) {
      if (eventArgs[0].i32 != 0) {
        m_stackNodeDelegate->onHoverIn();
      } else {
        m_stackNodeDelegate->onHoverOut();
      }
    }
  }
}

void StackNode::onClick() {
  if (m_stackNodeDelegate != nullptr) {
    m_stackNodeDelegate->onClick();
  }
}

StackNode::~StackNode() {
  unregisterNodeEvent(NODE_ON_CLICK);
  unregisterNodeEvent(NODE_ON_HOVER);
  NativeNodeApi::getInstance()->removeAllChildren(m_nodeHandle);
}

StackNode& StackNode::setAlign(int32_t align) {
  ArkUI_NumberValue value[] = {{.i32 = align}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_STACK_ALIGN_CONTENT, &item));
  return *this;
}
} // namespace rnoh
