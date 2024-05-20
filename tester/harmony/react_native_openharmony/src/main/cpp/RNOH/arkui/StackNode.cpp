#include "StackNode.h"

#include <glog/logging.h>
#include <memory>
#include "NativeNodeApi.h"

namespace rnoh {

StackNode::StackNode()
    : ArkUINode(NativeNodeApi::getInstance()->createNode(
          ArkUI_NodeType::ARKUI_NODE_STACK)),
      m_stackNodeDelegate(nullptr) {
  maybeThrow(NativeNodeApi::getInstance()->registerNodeEvent(
      m_nodeHandle, NODE_ON_CLICK, 0, this));
  maybeThrow(NativeNodeApi::getInstance()->registerNodeEvent(
      m_nodeHandle, NODE_ON_HOVER, 0, this));
}

void StackNode::insertChild(ArkUINode& child, std::size_t index) {
  maybeThrow(NativeNodeApi::getInstance()->insertChildAt(
      m_nodeHandle, child.getArkUINodeHandle(), static_cast<int32_t>(index)));
}

void StackNode::addChild(ArkUINode &child){
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
  if (eventType == ArkUI_NodeEventType::NODE_ON_CLICK &&
      eventArgs[3].i32 != 2) {
    onClick();
  }
  if (eventType == ArkUI_NodeEventType::NODE_ON_HOVER) {
    if (m_stackNodeDelegate != nullptr) {
      if (eventArgs[0].i32) {
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
  NativeNodeApi::getInstance()->unregisterNodeEvent(
      m_nodeHandle, NODE_ON_CLICK);
  NativeNodeApi::getInstance()->unregisterNodeEvent(
      m_nodeHandle, NODE_ON_HOVER);
}

StackNode& StackNode::setAlign(int32_t align) {
  ArkUI_NumberValue value[] = {{.i32 = align}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_STACK_ALIGN_CONTENT, &item));
  return *this;
}

void StackNode::registerNodeEvent(ArkUI_NodeEventType event) {
  maybeThrow(NativeNodeApi::getInstance()->registerNodeEvent(
    m_nodeHandle, event, 0, this));
}

void StackNode::unregisterNodeEvent(ArkUI_NodeEventType event) {
  NativeNodeApi::getInstance()->unregisterNodeEvent(
    m_nodeHandle, event);
}

void StackNode::reset() {
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_STACK_ALIGN_CONTENT));    
//  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
//    m_nodeHandle, NODE_POSITION));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_WIDTH));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_HEIGHT));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_BORDER_WIDTH));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_BORDER_COLOR));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_BORDER_RADIUS));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_BORDER_STYLE));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_CUSTOM_SHADOW));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_HIT_TEST_BEHAVIOR));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_ACCESSIBILITY_DESCRIPTION));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_ACCESSIBILITY_MODE));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_ACCESSIBILITY_TEXT));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_ACCESSIBILITY_GROUP));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_ID));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_BACKGROUND_COLOR));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_TRANSFORM_CENTER));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_TRANSFORM));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_OPACITY));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_CLIP));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_ALIGNMENT));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_OFFSET));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_ENABLED));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_FOCUS_STATUS));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_MARGIN));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_PADDING));
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
    m_nodeHandle, NODE_VISIBILITY));
}
} // namespace rnoh
