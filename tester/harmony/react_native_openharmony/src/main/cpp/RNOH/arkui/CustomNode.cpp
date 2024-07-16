#include "CustomNode.h"

#include <glog/logging.h>
#include <memory>
#include "NativeNodeApi.h"

namespace rnoh {
static const int32_t ON_MEASURE_TARGET_ID = 89;
static const int32_t ON_LAYOUT_TARGET_ID = 90;

void CustomNode::receiveCustomEvent(ArkUI_NodeCustomEvent* event) {
  auto* node = reinterpret_cast<CustomNode*>(
      OH_ArkUI_NodeCustomEvent_GetUserData(event));

  auto type = OH_ArkUI_NodeCustomEvent_GetEventType(event);
  switch (type) {
    case ARKUI_NODE_CUSTOM_EVENT_ON_MEASURE:
      node->onMeasure();
      break;
    case ARKUI_NODE_CUSTOM_EVENT_ON_LAYOUT:
      node->onLayout();
    default:
      break;
  }
}

CustomNode::CustomNode()
    : ArkUINode(NativeNodeApi::getInstance()->createNode(
          ArkUI_NodeType::ARKUI_NODE_CUSTOM)),
      m_customNodeDelegate(nullptr) {
  registerNodeEvent(NODE_ON_CLICK);
  registerNodeEvent(NODE_ON_HOVER);
  maybeThrow(NativeNodeApi::getInstance()->addNodeCustomEventReceiver(
      m_nodeHandle, receiveCustomEvent));
  maybeThrow(NativeNodeApi::getInstance()->registerNodeCustomEvent(
      m_nodeHandle,
      ARKUI_NODE_CUSTOM_EVENT_ON_MEASURE,
      ON_MEASURE_TARGET_ID,
      this));
  maybeThrow(NativeNodeApi::getInstance()->registerNodeCustomEvent(
      m_nodeHandle,
      ARKUI_NODE_CUSTOM_EVENT_ON_LAYOUT,
      ON_LAYOUT_TARGET_ID,
      this));
}

void CustomNode::insertChild(ArkUINode& child, std::size_t index) {
  maybeThrow(NativeNodeApi::getInstance()->insertChildAt(
      m_nodeHandle, child.getArkUINodeHandle(), static_cast<int32_t>(index)));
}

void CustomNode::removeChild(ArkUINode& child) {
  maybeThrow(NativeNodeApi::getInstance()->removeChild(
      m_nodeHandle, child.getArkUINodeHandle()));
}

void CustomNode::setCustomNodeDelegate(CustomNodeDelegate* customNodeDelegate) {
  m_customNodeDelegate = customNodeDelegate;
}

void CustomNode::onNodeEvent(
    ArkUI_NodeEventType eventType,
    EventArgs& eventArgs) {
  if (eventType == ArkUI_NodeEventType::NODE_ON_CLICK &&
      eventArgs[3].i32 != 2) {
    onClick();
  }
  if (eventType == ArkUI_NodeEventType::NODE_ON_HOVER) {
    if (m_customNodeDelegate != nullptr) {
      if (eventArgs[0].i32 != 0) {
        m_customNodeDelegate->onHoverIn(m_customNodeDelegate);
      } else {
        m_customNodeDelegate->onHoverOut(m_customNodeDelegate);
      }
    }
  }
}

void CustomNode::onClick() {
  if (m_customNodeDelegate != nullptr) {
    m_customNodeDelegate->onClick(m_customNodeDelegate);
  }
}

void CustomNode::onMeasure() {
  int32_t width = getMeasuredWidth();
  int32_t height = getMeasuredHeight();
  maybeThrow(NativeNodeApi::getInstance()->setMeasuredSize(
      m_nodeHandle, width, height));
}

void CustomNode::onLayout() {}

CustomNode::~CustomNode() {
  unregisterNodeEvent(NODE_ON_CLICK);
  unregisterNodeEvent(NODE_ON_HOVER);
  NativeNodeApi::getInstance()->unregisterNodeCustomEvent(
      m_nodeHandle, ARKUI_NODE_CUSTOM_EVENT_ON_MEASURE);
  NativeNodeApi::getInstance()->unregisterNodeCustomEvent(
      m_nodeHandle, ARKUI_NODE_CUSTOM_EVENT_ON_LAYOUT);
  NativeNodeApi::getInstance()->removeNodeCustomEventReceiver(
      m_nodeHandle, receiveCustomEvent);
}

CustomNode& CustomNode::setAlign(int32_t align) {
  ArkUI_NumberValue value[] = {{.i32 = align}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_STACK_ALIGN_CONTENT, &item));
  return *this;
}

CustomNode& CustomNode::setLayoutRect(
    facebook::react::Point const& position,
    facebook::react::Size const& size,
    facebook::react::Float pointScaleFactor) {
  auto width = static_cast<int32_t>(size.width * pointScaleFactor + 0.5);
  auto height = static_cast<int32_t>(size.height * pointScaleFactor + 0.5);
  updateMeasuredSize(width, height);
  ArkUINode::setLayoutRect(position, size, pointScaleFactor);
  return *this;
}

void CustomNode::updateMeasuredSize(int32_t width, int32_t height) {
  m_measuredWidth = width;
  m_measuredHeight = height;
}

int32_t CustomNode::getMeasuredWidth() {
  return m_measuredWidth;
}

int32_t CustomNode::getMeasuredHeight() {
  return m_measuredHeight;
}
} // namespace rnoh
