/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "ArkUINode.h"
#include <arkui/native_node.h>
#include <arkui/native_type.h>
#include <algorithm>
#include "NativeNodeApi.h"
#include "RNOH/Assert.h"
#include "conversions.h"
#include "react/renderer/graphics/Transform.h"

namespace rnoh {

const std::unordered_map<std::string, ArkUI_NodeType> NODE_TYPE_BY_ROLE_NAME = {
    {"button", ARKUI_NODE_BUTTON},
    {"togglebutton", ARKUI_NODE_TOGGLE},
    {"search", ARKUI_NODE_TEXT_INPUT},
    {"image", ARKUI_NODE_IMAGE},
    {"text", ARKUI_NODE_TEXT},
    {"adjustable", ARKUI_NODE_SLIDER},
    {"imagebutton", ARKUI_NODE_BUTTON},
    {"checkbox", ARKUI_NODE_CHECKBOX},
    {"menuitem", ARKUI_NODE_LIST_ITEM},
    {"progressbar", ARKUI_NODE_PROGRESS},
    {"radio", ARKUI_NODE_RADIO},
    {"scrollbar", ARKUI_NODE_SCROLL},
    {"switch", ARKUI_NODE_TOGGLE},
    {"list", ARKUI_NODE_LIST},
    {"cell", ARKUI_NODE_GRID_ITEM},
    {"grid", ARKUI_NODE_GRID},
    {"img", ARKUI_NODE_IMAGE},
    {"listitem", ARKUI_NODE_LIST_ITEM},
    {"marquee", ARKUI_NODE_IMAGE_ANIMATOR},
    {"meter", ARKUI_NODE_PROGRESS},
    {"option", ARKUI_NODE_LIST_ITEM},
    {"row", ARKUI_NODE_ROW},
    {"searchbox", ARKUI_NODE_TEXT_INPUT},
    {"slider", ARKUI_NODE_SLIDER},
    {"table", ARKUI_NODE_GRID},
};

const std::unordered_map<facebook::react::Role, ArkUI_NodeType>
    ROLE_BY_ROLE_TYPE = {
        {facebook::react::Role::Button, ARKUI_NODE_BUTTON},
        {facebook::react::Role::Cell, ARKUI_NODE_GRID_ITEM},
        {facebook::react::Role::Checkbox, ARKUI_NODE_CHECKBOX},
        {facebook::react::Role::Grid, ARKUI_NODE_GRID},
        {facebook::react::Role::Img, ARKUI_NODE_IMAGE},
        {facebook::react::Role::List, ARKUI_NODE_LIST},
        {facebook::react::Role::Listitem, ARKUI_NODE_LIST_ITEM},
        {facebook::react::Role::Marquee, ARKUI_NODE_IMAGE_ANIMATOR},
        {facebook::react::Role::Meter, ARKUI_NODE_PROGRESS},
        {facebook::react::Role::Option, ARKUI_NODE_LIST_ITEM},
        {facebook::react::Role::Progressbar, ARKUI_NODE_PROGRESS},
        {facebook::react::Role::Radio, ARKUI_NODE_RADIO},
        {facebook::react::Role::Row, ARKUI_NODE_ROW},
        {facebook::react::Role::Scrollbar, ARKUI_NODE_SCROLL},
        {facebook::react::Role::Searchbox, ARKUI_NODE_TEXT_INPUT},
        {facebook::react::Role::Slider, ARKUI_NODE_SLIDER},
        {facebook::react::Role::Switch, ARKUI_NODE_TOGGLE},
        {facebook::react::Role::Table, ARKUI_NODE_GRID},
};

std::optional<ArkUI_NodeType> roleNameToNodeType(const std::string& roleName) {
  auto it = NODE_TYPE_BY_ROLE_NAME.find(roleName);
  if (it != NODE_TYPE_BY_ROLE_NAME.end()) {
    return it->second;
  }
  return std::nullopt;
}

std::optional<ArkUI_NodeType> roleNameToNodeType(facebook::react::Role role) {
  auto it = ROLE_BY_ROLE_TYPE.find(role);
  if (it != ROLE_BY_ROLE_TYPE.end()) {
    return it->second;
  }
  return std::nullopt;
}

const std::unordered_map<std::string, ArkUI_AccessibilityActionType>
    ACTION_TYPE_BY_NAME = {
        {"activate", ARKUI_ACCESSIBILITY_ACTION_CLICK},
        {"longpress", ARKUI_ACCESSIBILITY_ACTION_LONG_CLICK},
        {"cut", ARKUI_ACCESSIBILITY_ACTION_CUT},
        {"copy", ARKUI_ACCESSIBILITY_ACTION_COPY},
        {"paste", ARKUI_ACCESSIBILITY_ACTION_PASTE},
};

std::optional<ArkUI_AccessibilityActionType> actionNameToType(
    const std::string& name) {
  auto it = ACTION_TYPE_BY_NAME.find(name);
  if (it != ACTION_TYPE_BY_NAME.end()) {
    return it->second;
  } else {
    return std::nullopt;
  }
}

std::optional<std::string> actionTypeToName(
    ArkUI_AccessibilityActionType type) {
  for (const auto& pair : ACTION_TYPE_BY_NAME) {
    if (pair.second == type) {
      return pair.first;
    }
  }
  return std::nullopt;
}

static constexpr std::array NODE_EVENT_TYPES{
    NODE_ON_ACCESSIBILITY_ACTIONS,
    NODE_ON_TOUCH_INTERCEPT};

static std::unordered_map<ArkUI_NodeHandle, ArkUINode*> NODE_BY_HANDLE;

static void receiveEvent(ArkUI_NodeEvent* event) {
  try {
    auto eventType = OH_ArkUI_NodeEvent_GetEventType(event);
    auto node = OH_ArkUI_NodeEvent_GetNodeHandle(event);
    auto it = NODE_BY_HANDLE.find(node);
    if (it == NODE_BY_HANDLE.end()) {
      DLOG(WARNING) << "Node with handle: " << node << " not found";
      return;
    }
    auto target = it->second;

    if (eventType == ArkUI_NodeEventType::NODE_TOUCH_EVENT) {
      // Node Touch events are handled in UIInputEventHandler instead
      return;
    }

    if (eventType == ArkUI_NodeEventType::NODE_ON_TOUCH_INTERCEPT) {
      auto inputEvent = OH_ArkUI_NodeEvent_GetInputEvent(event);
      target->onTouchIntercept(inputEvent);
      return;
    }

    auto componentEvent = OH_ArkUI_NodeEvent_GetNodeComponentEvent(event);
    if (componentEvent != nullptr) {
      target->onNodeEvent(eventType, componentEvent->data);
      return;
    }
    auto eventString = OH_ArkUI_NodeEvent_GetStringAsyncEvent(event);
    if (eventString != nullptr) {
      target->onNodeEvent(eventType, std::string_view(eventString->pStr));
      return;
    }
    target->onNodeEvent(eventType, event);
  } catch (std::exception& e) {
    LOG(ERROR) << e.what();
  }
}

ArkUINode::ArkUINode(ArkUI_NodeHandle nodeHandle) : m_nodeHandle(nodeHandle) {
  RNOH_ASSERT(nodeHandle != nullptr);
  maybeThrow(NativeNodeApi::getInstance()->addNodeEventReceiver(
      m_nodeHandle, receiveEvent));
  NODE_BY_HANDLE.emplace(m_nodeHandle, this);
  for (auto eventType : NODE_EVENT_TYPES) {
    this->registerNodeEvent(eventType);
  }
}

ArkUINode::~ArkUINode() noexcept {
  for (auto eventType : NODE_EVENT_TYPES) {
    this->unregisterNodeEvent(eventType);
  }
  if (m_arkUINodeDelegate != nullptr) {
    m_arkUINodeDelegate->onArkUINodeDestroy(this);
  }
  auto it = NODE_BY_HANDLE.find(m_nodeHandle);
  if (it != NODE_BY_HANDLE.end()) {
    NODE_BY_HANDLE.erase(it);
  }
  NativeNodeApi::getInstance()->removeNodeEventReceiver(
      m_nodeHandle, receiveEvent);
  NativeNodeApi::getInstance()->disposeNode(m_nodeHandle);
}

void ArkUINode::setArkUINodeDelegate(ArkUINodeDelegate* delegate) {
  m_arkUINodeDelegate = delegate;
}

ArkUI_NodeHandle ArkUINode::getArkUINodeHandle() {
  return m_nodeHandle;
}

void ArkUINode::markDirty() {
  // TODO: maybe this can be passed as an arg here,
  // and Component Instance can decide which flag to set in each mutation
  NativeNodeApi::getInstance()->markDirty(
      getArkUINodeHandle(), ArkUI_NodeDirtyFlag::NODE_NEED_RENDER);
  NativeNodeApi::getInstance()->markDirty(
      getArkUINodeHandle(), ArkUI_NodeDirtyFlag::NODE_NEED_LAYOUT);
  NativeNodeApi::getInstance()->markDirty(
      getArkUINodeHandle(), ArkUI_NodeDirtyFlag::NODE_NEED_MEASURE);
}

ArkUINode& ArkUINode::setPosition(facebook::react::Point const& position) {
  ArkUI_NumberValue value[] = {
      static_cast<float>(position.x), static_cast<float>(position.y)};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_POSITION, &item));
  return *this;
}

ArkUINode& ArkUINode::setSize(facebook::react::Size const& size) {
  // HACK: ArkUI doesn't handle 0-sized views properly
  ArkUI_NumberValue widthValue[] = {
      static_cast<float>(size.width > 0 ? size.width : 0.01)};
  ArkUI_AttributeItem widthItem = {
      widthValue, sizeof(widthValue) / sizeof(ArkUI_NumberValue)};

  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_WIDTH, &widthItem));

  // HACK: ArkUI doesn't handle 0-sized views properly
  ArkUI_NumberValue heightValue[] = {
      static_cast<float>(size.height > 0 ? size.height : 0.01)};
  ArkUI_AttributeItem heightItem = {
      heightValue, sizeof(heightValue) / sizeof(ArkUI_NumberValue)};

  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_HEIGHT, &heightItem));
  return *this;
}

void ArkUINode::saveSize(int32_t width, int32_t height) {
  m_measuredWidth = width;
  m_measuredHeight = height;
}

int32_t ArkUINode::getSavedWidth() {
  return m_measuredWidth;
}

int32_t ArkUINode::getSavedHeight() {
  return m_measuredHeight;
}

ArkUINode& ArkUINode::setHeight(float height) {
  ArkUI_NumberValue heightValue[] = {{.f32 = height}};
  ArkUI_AttributeItem heightItem = {
      heightValue, sizeof(heightValue) / sizeof(ArkUI_NumberValue)};

  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_HEIGHT, &heightItem));
  return *this;
}

ArkUINode& ArkUINode::setLayoutRect(
    facebook::react::Point const& position,
    facebook::react::Size const& size,
    facebook::react::Float pointScaleFactor) {
  ArkUI_NumberValue value[] = {
      {.i32 = static_cast<int32_t>(position.x * pointScaleFactor + 0.5)},
      {.i32 = static_cast<int32_t>(position.y * pointScaleFactor + 0.5)},
      {.i32 = static_cast<int32_t>(size.width * pointScaleFactor + 0.5)},
      {.i32 = static_cast<int32_t>(size.height * pointScaleFactor + 0.5)}};
  this->saveSize(value[2].i32, value[3].i32);
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_LAYOUT_RECT, &item));
  return *this;
}

ArkUINode& ArkUINode::setLayoutRect(
    facebook::react::LayoutMetrics const& layoutMetrics) {
  setLayoutRect(
      layoutMetrics.frame.origin,
      layoutMetrics.frame.size,
      layoutMetrics.pointScaleFactor);
  return *this;
}

ArkUINode& ArkUINode::setWidth(float width) {
  ArkUI_NumberValue widthValue[] = {{.f32 = width}};
  ArkUI_AttributeItem widthItem = {
      widthValue, sizeof(widthValue) / sizeof(ArkUI_NumberValue)};

  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_WIDTH, &widthItem));
  return *this;
}

ArkUINode& ArkUINode::setBorderWidth(
    facebook::react::BorderWidths const& borderWidths) {
  facebook::react::BorderWidths borderWidth;
  borderWidth.top = std::max(borderWidths.top, 0.0);
  borderWidth.right = std::max(borderWidths.right, 0.0);
  borderWidth.bottom = std::max(borderWidths.bottom, 0.0);
  borderWidth.left = std::max(borderWidths.left, 0.0);
  ArkUI_NumberValue borderWidthValue[] = {
      static_cast<float>(borderWidth.top),
      static_cast<float>(borderWidth.right),
      static_cast<float>(borderWidth.bottom),
      static_cast<float>(borderWidth.left)};

  ArkUI_AttributeItem borderWidthItem = {
      borderWidthValue, sizeof(borderWidthValue) / sizeof(ArkUI_NumberValue)};

  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_BORDER_WIDTH, &borderWidthItem));
  return *this;
}

ArkUINode& ArkUINode::setBorderColor(
    facebook::react::BorderColors const& borderColors) {
  uint32_t borderTopColor = 0xff000000;
  uint32_t borderRightColor = 0xff000000;
  uint32_t borderBottomColor = 0xff000000;
  uint32_t borderLeftColor = 0xff000000;
  if (borderColors.top) {
    borderTopColor = (uint32_t)*borderColors.top;
  }
  if (borderColors.right) {
    borderRightColor = (uint32_t)*borderColors.right;
  }
  if (borderColors.bottom) {
    borderBottomColor = (uint32_t)*borderColors.bottom;
  }
  if (borderColors.left) {
    borderLeftColor = (uint32_t)*borderColors.left;
  }
  ArkUI_NumberValue borderColorValue[] = {
      {.u32 = borderTopColor},
      {.u32 = borderRightColor},
      {.u32 = borderBottomColor},
      {.u32 = borderLeftColor}};

  ArkUI_AttributeItem borderColorItem = {
      borderColorValue, sizeof(borderColorValue) / sizeof(ArkUI_NumberValue)};

  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_BORDER_COLOR, &borderColorItem));
  return *this;
}

ArkUINode& ArkUINode::setBorderRadius(
    facebook::react::BorderRadii const& borderRadius) {
  /* React Native introduced partial support for elliptical radii in version
   * 0.76. https://github.com/facebook/react-native/pull/46009.
   *
   * The difference between OH and Android can be observed when a radius
   * uses a "%" unit on a non-square view.*/
  ArkUI_NumberValue borderRadiusValue[] = {
      static_cast<float>(
          (borderRadius.topLeft.horizontal + borderRadius.topLeft.vertical) /
          2),
      static_cast<float>(
          (borderRadius.topRight.horizontal + borderRadius.topRight.vertical) /
          2),
      static_cast<float>(
          (borderRadius.bottomLeft.horizontal +
           borderRadius.bottomLeft.vertical) /
          2),
      static_cast<float>(
          (borderRadius.bottomRight.horizontal +
           borderRadius.bottomRight.vertical) /
          2),
  };

  ArkUI_AttributeItem borderRadiusItem = {
      borderRadiusValue, sizeof(borderRadiusValue) / sizeof(ArkUI_NumberValue)};

  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_BORDER_RADIUS, &borderRadiusItem));
  return *this;
}

ArkUINode& ArkUINode::setBorderStyle(
    facebook::react::BorderStyles const& borderStyles) {
  ArkUI_NumberValue borderStyleValue[] = {
      {.i32 = static_cast<int32_t>(
           rnoh::convertReactBorderStyleToArk(borderStyles.top))},
      {.i32 = static_cast<int32_t>(
           rnoh::convertReactBorderStyleToArk(borderStyles.right))},
      {.i32 = static_cast<int32_t>(
           rnoh::convertReactBorderStyleToArk(borderStyles.bottom))},
      {.i32 = static_cast<int32_t>(
           rnoh::convertReactBorderStyleToArk(borderStyles.left))}};

  ArkUI_AttributeItem borderStyleItem = {
      borderStyleValue, sizeof(borderStyleValue) / sizeof(ArkUI_NumberValue)};

  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_BORDER_STYLE, &borderStyleItem));
  return *this;
}

ArkUINode& ArkUINode::setShadow(
    facebook::react::SharedColor const& shadowColor,
    facebook::react::Size const& shadowOffset,
    float const shadowOpacity,
    float const shadowRadius,
    facebook::react::Float pointScaleFactor) {
  if (shadowOpacity <= 0.0) {
    return *this;
  }
  float shadowOpacityValue = shadowOpacity > 1.0 ? 1.0 : shadowOpacity;
  uint32_t shadowColorValue = 0xff000000;
  if (shadowColor) {
    shadowColorValue = *shadowColor;
  }
  auto alpha = static_cast<uint32_t>(
      (float)((shadowColorValue >> 24) & (0xff)) * shadowOpacityValue);
  shadowColorValue = (alpha << 24) + (shadowColorValue & 0xffffff);
  float offsetXInPx = shadowOffset.width * pointScaleFactor;
  float offsetYInPx = shadowOffset.height * pointScaleFactor;
  float shadowRadiusInPx = shadowRadius * pointScaleFactor;
  ArkUI_NumberValue shadowValue[] = {
      {.f32 = shadowRadiusInPx},
      {.i32 = 0},
      {.f32 = offsetXInPx},
      {.f32 = offsetYInPx},
      {.i32 = 0},
      {.u32 = shadowColorValue},
      {.u32 = 0}};
  ArkUI_AttributeItem shadowItem = {
      .value = shadowValue,
      .size = sizeof(shadowValue) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_CUSTOM_SHADOW, &shadowItem));
  return *this;
}

/**
 * @deprecated This is internal method. Do not use it, it will be removed in
 * the future (latestRNOHVersion: 0.75.2)
 */
ArkUINode& ArkUINode::setHitTestMode(ArkUI_HitTestMode hitTestMode) {
  setAttribute(
      NODE_HIT_TEST_BEHAVIOR, {{.i32 = static_cast<int32_t>(hitTestMode)}});
  return *this;
}

/**
 * @deprecated The matching of pointerEvents and hitTestBehavior has been
 * moved to CppComponentInstance::onArkUINodeTouchIntercept (latestRNOHVersion:
 * 0.75.2)
 */
ArkUINode& ArkUINode::setHitTestMode(
    facebook::react::PointerEventsMode const& pointerEvents) {
  return *this;
}

ArkUINode& ArkUINode::setAccessibilityRole(std::string const& roleName) {
  if (roleName == "none") {
    NativeNodeApi::getInstance()->resetAttribute(
        m_nodeHandle, NODE_ACCESSIBILITY_ROLE);
    return *this;
  }
  std::optional<ArkUI_NodeType> maybeNodeType = roleNameToNodeType(roleName);
  if (!maybeNodeType.has_value()) {
    DLOG(WARNING) << "Unsupported accessibility role: " << roleName;
    NativeNodeApi::getInstance()->resetAttribute(
        m_nodeHandle, NODE_ACCESSIBILITY_ROLE);
    return *this;
  }
  auto nodeType = maybeNodeType.value();
  ArkUI_NumberValue value[] = {{.u32 = nodeType}};
  ArkUI_AttributeItem attr = {
      .value = value, .size = sizeof(nodeType) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_ACCESSIBILITY_ROLE, &attr));
  return *this;
}

ArkUINode& ArkUINode::setAccessibilityRole(facebook::react::Role roleName) {
  if (roleName == facebook::react::Role::None) {
    NativeNodeApi::getInstance()->resetAttribute(
        m_nodeHandle, NODE_ACCESSIBILITY_ROLE);
    return *this;
  }
  std::optional<ArkUI_NodeType> maybeNodeType = roleNameToNodeType(roleName);
  if (!maybeNodeType.has_value()) {
    NativeNodeApi::getInstance()->resetAttribute(
        m_nodeHandle, NODE_ACCESSIBILITY_ROLE);
    return *this;
  }
  auto nodeType = maybeNodeType.value();
  ArkUI_NumberValue value[] = {{.u32 = nodeType}};
  ArkUI_AttributeItem attr = {
      .value = value, .size = sizeof(nodeType) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_ACCESSIBILITY_ROLE, &attr));
  return *this;
}

ArkUINode& ArkUINode::setAccessibilityActions(
    const std::vector<facebook::react::AccessibilityAction>& rnActions) {
  std::vector<ArkUI_NumberValue> actionTypes;
  actionTypes.reserve(rnActions.size());
  for (const auto& rnAction : rnActions) {
    auto actionType = actionNameToType(rnAction.name);
    if (!actionType.has_value()) {
      DLOG(WARNING) << "Unsupported accessibility action: " << rnAction.name;
      continue;
    }
    actionTypes.push_back({.u32 = actionType.value()});
  }
  if (actionTypes.empty()) {
    maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
        m_nodeHandle, NODE_ACCESSIBILITY_ACTIONS));
  } else {
    ArkUI_AttributeItem attr = {
        .value = actionTypes.data(),
        .size = static_cast<int32_t>(actionTypes.size())};
    maybeThrow(NativeNodeApi::getInstance()->setAttribute(
        m_nodeHandle, NODE_ACCESSIBILITY_ACTIONS, &attr));
  }
  return *this;
}

ArkUINode& ArkUINode::setAccessibilityDescription(
    std::string const& accessibilityDescription) {
  ArkUI_AttributeItem descriptionItem = {
      .string = accessibilityDescription.c_str()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_ACCESSIBILITY_DESCRIPTION, &descriptionItem));
  return *this;
}

ArkUINode& ArkUINode::setAccessibilityState(
    const facebook::react::AccessibilityState& rnState) {
  std::unique_ptr<
      ArkUI_AccessibilityState,
      decltype(&OH_ArkUI_AccessibilityState_Dispose)>
      state(
          OH_ArkUI_AccessibilityState_Create(),
          OH_ArkUI_AccessibilityState_Dispose);
  OH_ArkUI_AccessibilityState_SetDisabled(state.get(), rnState.disabled);
  OH_ArkUI_AccessibilityState_SetCheckedState(
      state.get(),
      rnState.checked == facebook::react::AccessibilityState::Checked);
  OH_ArkUI_AccessibilityState_SetSelected(state.get(), rnState.selected);
  ArkUI_AttributeItem item = {.object = state.get()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_ACCESSIBILITY_STATE, &item));
  return *this;
}

ArkUINode& ArkUINode::setAccessibilityState(
    const std::optional<facebook::react::AccessibilityState>& maybeA11yState) {
  if (!maybeA11yState.has_value()) {
    maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
        m_nodeHandle, NODE_ACCESSIBILITY_STATE));
    return *this;
  }
  const auto& a11yState = maybeA11yState.value();
  std::unique_ptr<
      ArkUI_AccessibilityState,
      decltype(&OH_ArkUI_AccessibilityState_Dispose)>
      state(
          OH_ArkUI_AccessibilityState_Create(),
          OH_ArkUI_AccessibilityState_Dispose);
  OH_ArkUI_AccessibilityState_SetDisabled(state.get(), a11yState.disabled);
  OH_ArkUI_AccessibilityState_SetCheckedState(
      state.get(),
      a11yState.checked == facebook::react::AccessibilityState::Checked);
  OH_ArkUI_AccessibilityState_SetSelected(state.get(), a11yState.selected);
  ArkUI_AttributeItem item = {.object = state.get()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_ACCESSIBILITY_STATE, &item));
  return *this;
}

/**
 * @deprecated (latestRNOHVersion: 0.75.1)
 */
ArkUINode& ArkUINode::setAccessibilityLevel(
    facebook::react::ImportantForAccessibility importance) {
  ArkUI_NumberValue levelValue[] = {{.i32 = static_cast<int32_t>(importance)}};
  ArkUI_AttributeItem levelItem = {
      .value = levelValue,
      .size = sizeof(levelValue) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_ACCESSIBILITY_MODE, &levelItem));
  return *this;
}

ArkUINode& ArkUINode::setAccessibilityMode(
    facebook::react::ImportantForAccessibility importance) {
  switch (importance) {
    case facebook::react::ImportantForAccessibility::Auto:
      this->setAccessibilityMode(
          ArkUI_AccessibilityMode::ARKUI_ACCESSIBILITY_MODE_AUTO);
      break;
    case facebook::react::ImportantForAccessibility::Yes:
      this->setAccessibilityMode(
          ArkUI_AccessibilityMode::ARKUI_ACCESSIBILITY_MODE_ENABLED);
      break;
    case facebook::react::ImportantForAccessibility::No:
      this->setAccessibilityMode(
          ArkUI_AccessibilityMode::ARKUI_ACCESSIBILITY_MODE_DISABLED);
      break;
    case facebook::react::ImportantForAccessibility::NoHideDescendants:
      this->setAccessibilityMode(
          ArkUI_AccessibilityMode::
              ARKUI_ACCESSIBILITY_MODE_DISABLED_FOR_DESCENDANTS);
      break;
    default:
      DLOG(WARNING) << "Unsupported importantForAccessibility value";
  }
  return *this;
}

ArkUINode& ArkUINode::setAccessibilityMode(ArkUI_AccessibilityMode mode) {
  ArkUI_NumberValue value = {.i32 = mode};
  setAttribute(NODE_ACCESSIBILITY_MODE, {value});
  return *this;
}

ArkUINode& ArkUINode::setAccessibilityText(
    std::string const& accessibilityLabel) {
  ArkUI_AttributeItem textItem = {.string = accessibilityLabel.c_str()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_ACCESSIBILITY_TEXT, &textItem));
  return *this;
}

ArkUINode& ArkUINode::setAccessibilityGroup(bool enableGroup) {
  ArkUI_NumberValue groupValue[] = {{.i32 = static_cast<int32_t>(enableGroup)}};
  ArkUI_AttributeItem groupItem = {
      .value = groupValue,
      .size = sizeof(groupValue) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_ACCESSIBILITY_GROUP, &groupItem));
  return *this;
}

ArkUINode& ArkUINode::setId(std::string const& id) {
  ArkUI_AttributeItem idItem = {.string = id.c_str()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_ID, &idItem));
  return *this;
}

std::string ArkUINode::getId() const {
  auto idItem =
      NativeNodeApi::getInstance()->getAttribute(m_nodeHandle, NODE_ID);
  RNOH_ASSERT(idItem != nullptr);
  return idItem->string;
}

ArkUINode& ArkUINode::setBackgroundColor(
    facebook::react::SharedColor const& color) {
  // TODO: figure out if we need to update (to a clear value), or return early
  // here
  uint32_t colorValue = facebook::react::isColorMeaningful(color)
      ? *color
      : *facebook::react::clearColor();
  setBackgroundColor(colorValue);
  return *this;
}

ArkUINode& ArkUINode::setBackgroundColor(uint32_t color) {
  ArkUI_NumberValue preparedColorValue[] = {{.u32 = color}};
  ArkUI_AttributeItem colorItem = {
      preparedColorValue,
      sizeof(preparedColorValue) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_BACKGROUND_COLOR, &colorItem));
  return *this;
}

ArkUINode& ArkUINode::setTransform(
    facebook::react::Transform const& transform,
    facebook::react::Float pointScaleFactor) {
  if (pointScaleFactor == 0.0) {
    // NOTE: while pointScaleFactor shouldn't logically be zero, we probably
    // don't want to assert it in case some exotic use case requires it
    return *this;
  }

  // NOTE: ArkUI translation is in `px` units, while React Native uses `vp`
  // units, so we need to correct for the scale factor here
  // We do so by first scaling the view down (to vp), applying the transform,
  // and then scaling the transformed view back up (to px)
  auto preScale = facebook::react::Transform::Scale(
      1 / pointScaleFactor, 1 / pointScaleFactor, 1 / pointScaleFactor);
  auto postScale = facebook::react::Transform::Scale(
      pointScaleFactor, pointScaleFactor, pointScaleFactor);

  auto matrix = (postScale * transform * preScale).matrix;

  std::array<ArkUI_NumberValue, 16> transformValue;
  for (int i = 0; i < 16; i++) {
    transformValue[i] = {.f32 = static_cast<float>(matrix[i])};
  }

  ArkUI_AttributeItem transformItem = {
      transformValue.data(), transformValue.size()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TRANSFORM, &transformItem));
  return *this;
}

ArkUINode& ArkUINode::setTranslate(float x, float y, float z) {
  ArkUI_NumberValue translateValue[] = {{.f32 = x}, {.f32 = y}, {.f32 = z}};
  ArkUI_AttributeItem translateItem = {
      translateValue, sizeof(translateValue) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TRANSLATE, &translateItem));
  return *this;
}

ArkUINode& ArkUINode::setOpacity(facebook::react::Float opacity) {
  ArkUI_NumberValue opacityValue[] = {{.f32 = (float)opacity}};
  ArkUI_AttributeItem opacityItem = {
      opacityValue, sizeof(opacityValue) / sizeof(ArkUI_NumberValue)};

  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_OPACITY, &opacityItem));
  return *this;
}

ArkUINode& ArkUINode::setClip(bool clip) {
  auto isClip = static_cast<uint32_t>(clip);
  ArkUI_NumberValue clipValue[] = {{.u32 = isClip}};
  ArkUI_AttributeItem clipItem = {
      clipValue, sizeof(clipValue) / sizeof(ArkUI_NumberValue)};

  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_CLIP, &clipItem));
  return *this;
}

ArkUINode& ArkUINode::setAlignment(Alignment alignment) {
  ArkUI_NumberValue alignmentValue[] = {
      {.i32 = static_cast<int32_t>(alignment)}};
  ArkUI_AttributeItem alignmentItem = {
      alignmentValue, sizeof(alignmentValue) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_ALIGNMENT, &alignmentItem));
  return *this;
}

ArkUINode& ArkUINode::setTranslateTransition(
    float translateX,
    float translateY,
    int32_t animationDurationMillis) {
  std::array<ArkUI_NumberValue, 5> translateValue = {
      ArkUI_NumberValue{.f32 = translateX},
      {.f32 = translateY},
      {.f32 = 0},
      {.i32 = animationDurationMillis},
      {.i32 = static_cast<int32_t>(ARKUI_CURVE_LINEAR)}};
  ArkUI_AttributeItem translateItem = {
      translateValue.data(), translateValue.size()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TRANSLATE_TRANSITION, &translateItem));
  return *this;
}

ArkUINode& ArkUINode::resetTranslateTransition() {
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
      m_nodeHandle, NODE_TRANSLATE_TRANSITION));
  return *this;
}

ArkUINode& ArkUINode::setOpacityTransition(int32_t animationDurationMillis) {
  std::array<ArkUI_NumberValue, 3> args = {
      ArkUI_NumberValue{.f32 = 0},
      {.i32 = animationDurationMillis},
      {.i32 = static_cast<int32_t>(ARKUI_CURVE_LINEAR)}};
  ArkUI_AttributeItem opacityItem = {args.data(), args.size()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_OPACITY_TRANSITION, &opacityItem));
  return *this;
}

ArkUINode& ArkUINode::resetOpacityTransition() {
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
      m_nodeHandle, NODE_OPACITY_TRANSITION));
  return *this;
}

ArkUINode& ArkUINode::setOffset(float x, float y) {
  ArkUI_NumberValue offsetValue[] = {{.f32 = x}, {.f32 = y}};
  ArkUI_AttributeItem offsetItem = {
      offsetValue, sizeof(offsetValue) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_OFFSET, &offsetItem));
  return *this;
}

ArkUINode& ArkUINode::setEnabled(bool enabled) {
  ArkUI_NumberValue value = {.i32 = int32_t(enabled)};
  ArkUI_AttributeItem item = {&value, 1};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_ENABLED, &item));
  return *this;
}

ArkUINode& ArkUINode::resetAccessibilityText() {
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
      m_nodeHandle, NODE_ACCESSIBILITY_TEXT));
  return *this;
}

void ArkUINode::onTouchIntercept(const ArkUI_UIInputEvent* event) {
  if (m_arkUINodeDelegate != nullptr) {
    m_arkUINodeDelegate->onArkUINodeTouchIntercept(event);
  }
}

void ArkUINode::onNodeEvent(
    ArkUI_NodeEventType eventType,
    EventArgs& eventArgs) {
  switch (eventType) {
    case ArkUI_NodeEventType::NODE_ON_ACCESSIBILITY_ACTIONS: {
      auto maybeActionName = actionTypeToName(
          static_cast<ArkUI_AccessibilityActionType>(eventArgs[0].u32));
      if (!maybeActionName.has_value()) {
        DLOG(WARNING) << "Unsupported action type: " << eventArgs[0].u32;
        return;
      }
      const auto& actionName = maybeActionName.value();
      if (m_arkUINodeDelegate == nullptr) {
        DLOG(WARNING) << "Cancelled " << actionName << " — delegate is nullptr";
        return;
      }
      m_arkUINodeDelegate->onArkUINodeAccessibilityAction(this, actionName);
      break;
    }
  }
}

void ArkUINode::onNodeEvent(
    ArkUI_NodeEventType eventType,
    std::string_view eventString) {}

void ArkUINode::onNodeEvent(
    ArkUI_NodeEventType eventType,
    ArkUI_NodeEvent* event) {}

ArkUINode& ArkUINode::setFocusStatus(int32_t focus) {
  std::array<ArkUI_NumberValue, 1> value = {{{.i32 = focus}}};
  ArkUI_AttributeItem item = {value.data(), value.size()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_FOCUS_STATUS, &item));
  return *this;
}

ArkUINode&
ArkUINode::setMargin(float left, float top, float right, float bottom) {
  ArkUI_NumberValue value[] = {
      {.f32 = top}, {.f32 = right}, {.f32 = bottom}, {.f32 = left}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_MARGIN, &item));
  return *this;
}

ArkUINode&
ArkUINode::setPadding(float left, float top, float right, float bottom) {
  ArkUI_NumberValue value[] = {
      {.f32 = top}, {.f32 = right}, {.f32 = bottom}, {.f32 = left}};
  ArkUI_AttributeItem item = {.value = value, .size = 4};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_PADDING, &item));
  return *this;
}

ArkUINode& ArkUINode::setVisibility(ArkUI_Visibility visibility) {
  ArkUI_NumberValue value[] = {{.i32 = visibility}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_VISIBILITY, &item));
  return *this;
}

ArkUINode& ArkUINode::setZIndex(float index) {
  std::array<ArkUI_NumberValue, 1> values = {{{.f32 = index}}};
  ArkUI_AttributeItem item = {values.data(), values.size()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_Z_INDEX, &item));
  return *this;
}

ArkUINode& ArkUINode::setRenderGroup(bool renderOffscreen) {
  ArkUI_NumberValue value[] = {{.i32 = (int32_t)renderOffscreen}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_RENDER_GROUP, &item));
  return *this;
}

ArkUI_IntOffset ArkUINode::getLayoutPosition() {
  return NativeNodeApi::getInstance()->getLayoutPosition(m_nodeHandle);
}

void ArkUINode::registerNodeEvent(ArkUI_NodeEventType eventType) {
  maybeThrow(NativeNodeApi::getInstance()->registerNodeEvent(
      m_nodeHandle, eventType, eventType, this));
}

void ArkUINode::unregisterNodeEvent(ArkUI_NodeEventType eventType) {
  NativeNodeApi::getInstance()->unregisterNodeEvent(m_nodeHandle, eventType);
}

const ArkUI_AttributeItem& ArkUINode::getAttribute(
    ArkUI_NodeAttributeType attribute) const {
  auto item =
      NativeNodeApi::getInstance()->getAttribute(m_nodeHandle, attribute);
  if (!item) {
    auto message = std::string("ArkUINode getAttribute failed: ") +
        std::to_string((attribute));
    LOG(ERROR) << message;
    throw std::runtime_error(std::move(message));
  }
  return *item;
}

ArkUINode& ArkUINode::setDirection(ArkUI_Direction direction) {
  ArkUI_NumberValue value = {.u32 = direction};
  ArkUI_AttributeItem item = {.value = &value, .size = 1};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_DIRECTION, &item));
  return *this;
}

void ArkUINode::setAttribute(
    ArkUI_NodeAttributeType attribute,
    ArkUI_AttributeItem const& item) {
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, attribute, &item));
}

void ArkUINode::setAttribute(
    ArkUI_NodeAttributeType attribute,
    std::initializer_list<ArkUI_NumberValue> values) {
  int32_t size = values.size();
  ArkUI_AttributeItem item{.value = std::data(values), .size = size};
  setAttribute(attribute, item);
}

} // namespace rnoh
