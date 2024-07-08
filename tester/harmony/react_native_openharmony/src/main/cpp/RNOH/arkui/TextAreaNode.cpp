#include "TextAreaNode.h"
#include <bits/alltypes.h>
#include "NativeNodeApi.h"
#include "RNOH/arkui/conversions.h"

static constexpr std::array TEXT_AREA_NODE_EVENT_TYPES = {
    NODE_TEXT_AREA_ON_PASTE,
    NODE_TEXT_AREA_ON_CHANGE,
    NODE_TEXT_INPUT_ON_CUT,
    NODE_ON_FOCUS,
    NODE_ON_BLUR,
    NODE_TEXT_AREA_ON_TEXT_SELECTION_CHANGE};

namespace rnoh {

TextAreaNode::TextAreaNode()
    : TextInputNodeBase(ArkUI_NodeType::ARKUI_NODE_TEXT_AREA),
      m_textAreaNodeDelegate(nullptr) {
  for (auto eventType : TEXT_AREA_NODE_EVENT_TYPES) {
    registerNodeEvent(eventType);
    // NODE_TEXT_AREA_ENABLE_KEYBOARD_ON_FOCUS missing in C-API
  }
}

TextAreaNode::~TextAreaNode() {
  for (auto eventType : TEXT_AREA_NODE_EVENT_TYPES) {
    unregisterNodeEvent(eventType);
  }
}

void TextAreaNode::onNodeEvent(
    ArkUI_NodeEventType eventType,
    EventArgs& eventArgs) {
  if (eventType == ArkUI_NodeEventType::NODE_ON_FOCUS) {
    if (m_textAreaNodeDelegate != nullptr) {
      m_textAreaNodeDelegate->onFocus();
    }
  } else if (eventType == ArkUI_NodeEventType::NODE_ON_BLUR) {
    if (m_textAreaNodeDelegate != nullptr) {
      m_textAreaNodeDelegate->onBlur();
    }
  } else if (
      eventType ==
      ArkUI_NodeEventType::NODE_TEXT_AREA_ON_TEXT_SELECTION_CHANGE) {
    if (m_textAreaNodeDelegate != nullptr) {
      int32_t selectionLocation = eventArgs[0].i32;
      int32_t selectionLength = eventArgs[1].i32 - eventArgs[0].i32;
      m_textAreaNodeDelegate->onTextSelectionChange(
          selectionLocation, selectionLength);
    }
  }
}

void TextAreaNode::onNodeEvent(
    ArkUI_NodeEventType eventType,
    std::string_view eventString) {
  if (eventType == ArkUI_NodeEventType::NODE_TEXT_AREA_ON_CHANGE) {
    if (m_textAreaNodeDelegate != nullptr) {
      std::string text(eventString);
      m_textAreaNodeDelegate->onChange(std::move(text));
    }
  } else if (eventType == ArkUI_NodeEventType::NODE_TEXT_AREA_ON_PASTE) {
    if (m_textAreaNodeDelegate != nullptr) {
      m_textAreaNodeDelegate->onPasteOrCut();
    }
  } else if (eventType == ArkUI_NodeEventType::NODE_TEXT_INPUT_ON_CUT) {
    if (m_textAreaNodeDelegate != nullptr) {
      m_textAreaNodeDelegate->onPasteOrCut();
    }
  }
  // NODE_TEXT_AREA_ON_CUT missing
}

void TextAreaNode::setTextAreaNodeDelegate(
    TextAreaNodeDelegate* textAreaNodeDelegate) {
  m_textAreaNodeDelegate = textAreaNodeDelegate;
}

facebook::react::Point TextAreaNode::getTextAreaOffset() const {
  auto value = NativeNodeApi::getInstance()
                   ->getAttribute(m_nodeHandle, NODE_OFFSET)
                   ->value;
  facebook::react::Float x = value[0].i32;
  facebook::react::Float y = value[1].i32;

  return facebook::react::Point{x, y};
}

void TextAreaNode::setTextContent(std::string const& textContent) {
  ArkUI_AttributeItem item = {.string = textContent.c_str()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_AREA_TEXT, &item));
}

void TextAreaNode::setInputType(ArkUI_TextAreaType keyboardType) {
  ArkUI_NumberValue value = {.i32 = keyboardType};
  ArkUI_AttributeItem item = {&value, sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_AREA_TYPE, &item));
}

void TextAreaNode::setFont(
    facebook::react::TextAttributes const& textAttributes) {
  TextInputNodeBase::setCommonFontAttributes(textAttributes);

  std::string fontFamily = "HarmonyOS Sans";
  if (!textAttributes.fontFamily.empty()) {
    fontFamily = textAttributes.fontFamily;
  }

  auto fontWeight = ARKUI_FONT_WEIGHT_NORMAL;
  if (textAttributes.fontWeight.has_value()) {
    fontWeight = rnoh::convertFontWeight(textAttributes.fontWeight.value());
  }

  auto fontStyle = ARKUI_FONT_STYLE_NORMAL;
  if (textAttributes.fontStyle.has_value() &&
      textAttributes.fontStyle.value() == facebook::react::FontStyle::Italic) {
    fontStyle = ARKUI_FONT_STYLE_ITALIC;
  }

  float fontSize = 16;
  if (!std::isnan(textAttributes.fontSize)) {
    fontSize = static_cast<float>(textAttributes.fontSize);
  }
  std::array<ArkUI_NumberValue, 3> value = {
      {{.f32 = fontSize},
       {.i32 = static_cast<int32_t>(fontStyle)},
       {.i32 = static_cast<int32_t>(fontWeight)}}};
  ArkUI_AttributeItem item = {value.data(), value.size(), fontFamily.c_str()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_AREA_PLACEHOLDER_FONT, &item));
}

void TextAreaNode::setLineHeight(float lineHeight) {
  ArkUI_NumberValue value[] = {{.f32 = lineHeight}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_LINE_HEIGHT, &item));
}

void TextAreaNode::setCaretColor(facebook::react::SharedColor const& color) {
  uint32_t colorValue = *color;
  ArkUI_NumberValue value = {.u32 = colorValue};
  ArkUI_AttributeItem item = {&value, sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_AREA_CARET_COLOR, &item));
}

void TextAreaNode::setMaxLength(int32_t maxLength) {
  ArkUI_NumberValue value = {.i32 = maxLength};
  ArkUI_AttributeItem item = {&value, sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_AREA_MAX_LENGTH, &item));
}

void TextAreaNode::setPlaceholder(std::string const& placeholder) {
  ArkUI_AttributeItem item = {.string = placeholder.c_str()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_AREA_PLACEHOLDER, &item));
}

void TextAreaNode::setPlaceholderColor(
    facebook::react::SharedColor const& color) {
  uint32_t colorValue = *color;
  ArkUI_NumberValue value = {.u32 = colorValue};
  ArkUI_AttributeItem item = {&value, sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_AREA_PLACEHOLDER_COLOR, &item));
}

void TextAreaNode::defaultSetPadding() {
  ArkUI_NumberValue value = {.f32 = 0.f};
  ArkUI_AttributeItem item = {&value, sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_PADDING, &item));
}

void TextAreaNode::setTextContentType(std::string const& textContentType) {
  std::array<ArkUI_NumberValue, 1> autoFillValue = {{{.i32 = 1}}};
  ArkUI_AttributeItem autoFillItem = {
      autoFillValue.data(), autoFillValue.size()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_ENABLE_AUTO_FILL, &autoFillItem));

  ArkUI_TextInputContentType type = rnoh::convertContentType(textContentType);

  if (type == static_cast<ArkUI_TextInputContentType>(-1)) {
    NativeNodeApi::getInstance()->resetAttribute(
        m_nodeHandle, NODE_TEXT_AREA_CONTENT_TYPE);
    return;
  }

  if (type == static_cast<ArkUI_TextInputContentType>(-2)) {
    autoFillValue = {{{.i32 = 0}}};
    autoFillItem = {autoFillValue.data(), autoFillValue.size()};
    maybeThrow(NativeNodeApi::getInstance()->setAttribute(
        m_nodeHandle, NODE_TEXT_INPUT_ENABLE_AUTO_FILL, &autoFillItem));
    NativeNodeApi::getInstance()->resetAttribute(
        m_nodeHandle, NODE_TEXT_AREA_CONTENT_TYPE);
    return;
  }

  std::array<ArkUI_NumberValue, 1> value = {{{.i32 = type}}};
  ArkUI_AttributeItem item = {value.data(), value.size()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_AREA_CONTENT_TYPE, &item));
}

std::string TextAreaNode::getTextContent() {
  auto item = NativeNodeApi::getInstance()->getAttribute(
      m_nodeHandle, NODE_TEXT_AREA_TEXT);
  return item->string;
}

void TextAreaNode::setContextMenuHidden(bool hidden) {
  std::array<ArkUI_NumberValue, 1> value = {
      {{.i32 = static_cast<int32_t>(hidden)}}};
  ArkUI_AttributeItem item = {value.data(), value.size()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_AREA_SELECTION_MENU_HIDDEN, &item));
}

void TextAreaNode::setBlurOnSubmit(bool blurOnSubmit) {
  ArkUI_NumberValue value = {.i32 = int32_t(blurOnSubmit)};
  ArkUI_AttributeItem item = {&value, 1};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_AREA_BLUR_ON_SUBMIT, &item));
}
} // namespace rnoh
