#include "TextInputNode.h"
#include "NativeNodeApi.h"
#include "RNOH/arkui/conversions.h"
#include "conversions.h"

static constexpr std::array TEXT_INPUT_NODE_EVENT_TYPES = {
    NODE_TEXT_INPUT_ON_PASTE,
    NODE_TEXT_INPUT_ON_CUT,
    NODE_TEXT_INPUT_ON_CHANGE,
    NODE_TEXT_INPUT_ON_SUBMIT,
    NODE_ON_FOCUS,
    NODE_ON_BLUR,
    NODE_TEXT_INPUT_ON_TEXT_SELECTION_CHANGE,
    NODE_TEXT_INPUT_ON_CONTENT_SCROLL,
    NODE_TEXT_INPUT_ON_CONTENT_SIZE_CHANGE};

namespace rnoh {

TextInputNode::TextInputNode()
    : TextInputNodeBase(ArkUI_NodeType::ARKUI_NODE_TEXT_INPUT),
      m_textInputNodeDelegate(nullptr) {
  for (auto eventType : TEXT_INPUT_NODE_EVENT_TYPES) {
    registerNodeEvent(eventType);
  }

  ArkUI_NumberValue value = {.i32 = 1};
  ArkUI_AttributeItem item = {&value, 1};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_ENABLE_KEYBOARD_ON_FOCUS, &item));
}

TextInputNode::~TextInputNode() {
  for (auto eventType : TEXT_INPUT_NODE_EVENT_TYPES) {
    unregisterNodeEvent(eventType);
  }
}

inline ArkUI_NumberValue convertContentType(
    std::string const& textContentType) {
  if (textContentType == "addressCity") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_CITY_ADDRESS};
  } else if (textContentType == "addressState") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_PROVINCE_ADDRESS};
  } else if (textContentType == "countryName") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_COUNTRY_ADDRESS};
  } else if (textContentType == "creditCardNumber") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_BANK_CARD_NUMBER};
  } else if (textContentType == "fullStreetAddress") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_FULL_STREET_ADDRESS};
  } else if (textContentType == "sublocality") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_DISTRICT_ADDRESS};
  } else if (textContentType == "telephoneNumber") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_PHONE_NUMBER};
  } else if (textContentType == "username") {
    return {
        .i32 =
            ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_USER_NAME};
  } else if (textContentType == "password") {
    return {
        .i32 =
            ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_PASSWORD};
  } else if (textContentType == "newPassword") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_NEW_PASSWORD};
  } else if (textContentType == "houseNumber") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_HOUSE_NUMBER};
  } else if (textContentType == "districtAddress") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_DISTRICT_ADDRESS};
  } else if (textContentType == "cityAddress") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_CITY_ADDRESS};
  } else if (textContentType == "provinceAddress") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_PROVINCE_ADDRESS};
  } else if (textContentType == "countryAddress") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_COUNTRY_ADDRESS};
  } else if (textContentType == "personFullName") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_FULL_NAME};
  } else if (textContentType == "personLastName") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_LAST_NAME};
  } else if (textContentType == "personFirstName") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_FIRST_NAME};
  } else if (textContentType == "phoneNumber") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_PHONE_NUMBER};
  } else if (textContentType == "phoneCountryCode") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_PHONE_COUNTRY_CODE};
  } else if (textContentType == "fullPhoneNumber") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_FULL_PHONE_NUMBER};
  } else if (textContentType == "emailAddress") {
    return {
        .i32 =
            ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_EMAIL_ADDRESS};
  } else if (textContentType == "bankCardNumber") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_BANK_CARD_NUMBER};
  } else if (textContentType == "idCardNumber") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_ID_CARD_NUMBER};
  } else if (textContentType == "nickName") {
    return {
        .i32 =
            ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_NICKNAME};
  } else if (textContentType == "name") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_FULL_NAME};
  } else if (textContentType == "familyName") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_LAST_NAME};
  } else if (textContentType == "givenName") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_FIRST_NAME};
  } else if (textContentType == "detailInfoWithoutStreet") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_DETAIL_INFO_WITHOUT_STREET};
  } else if (textContentType == "formatAddress") {
    return {
        .i32 = ArkUI_TextInputContentType::
            ARKUI_TEXTINPUT_CONTENT_TYPE_FORMAT_ADDRESS};
  } else {
    return {.i32 = -1};
  }
}

void TextInputNode::onNodeEvent(
    ArkUI_NodeEventType eventType,
    EventArgs& eventArgs) {
  if (eventType == ArkUI_NodeEventType::NODE_TEXT_INPUT_ON_SUBMIT) {
    if (m_textInputNodeDelegate != nullptr) {
      m_textInputNodeDelegate->onSubmit();
    }
  } else if (eventType == ArkUI_NodeEventType::NODE_ON_FOCUS) {
    if (m_textInputNodeDelegate != nullptr) {
      m_textInputNodeDelegate->onFocus();
    }
  } else if (eventType == ArkUI_NodeEventType::NODE_ON_BLUR) {
    if (m_textInputNodeDelegate != nullptr) {
      m_textInputNodeDelegate->onBlur();
    }
  } else if (
      eventType ==
      ArkUI_NodeEventType::NODE_TEXT_INPUT_ON_TEXT_SELECTION_CHANGE) {
    if (m_textInputNodeDelegate != nullptr) {
      int32_t selectionLocation = eventArgs[0].i32;
      int32_t selectionLength = eventArgs[1].i32 - eventArgs[0].i32;
      m_textInputNodeDelegate->onTextSelectionChange(
          selectionLocation, selectionLength);
    }
  } else if (
      eventType == ArkUI_NodeEventType::NODE_TEXT_INPUT_ON_CONTENT_SCROLL) {
    if (m_textInputNodeDelegate != nullptr) {
      m_textInputNodeDelegate->onContentScroll();
    }
  } else if (
      eventType ==
      ArkUI_NodeEventType::NODE_TEXT_INPUT_ON_CONTENT_SIZE_CHANGE) {
    if (m_textInputNodeDelegate != nullptr) {
      float width = eventArgs[0].f32;
      float height = eventArgs[1].f32;
      m_textInputNodeDelegate->onContentSizeChange(width, height);
    }
  }
}

void TextInputNode::onNodeEvent(
    ArkUI_NodeEventType eventType,
    std::string_view eventString) {
  if (eventType == ArkUI_NodeEventType::NODE_TEXT_INPUT_ON_CHANGE) {
    if (m_textInputNodeDelegate != nullptr) {
      std::string text(eventString);
      m_textInputNodeDelegate->onChange(std::move(text));
    }
  } else if (eventType == ArkUI_NodeEventType::NODE_TEXT_INPUT_ON_PASTE) {
    if (m_textInputNodeDelegate != nullptr) {
      m_textInputNodeDelegate->onPasteOrCut();
    }
  } else if (eventType == ArkUI_NodeEventType::NODE_TEXT_INPUT_ON_CUT) {
    if (m_textInputNodeDelegate != nullptr) {
      m_textInputNodeDelegate->onPasteOrCut();
    }
  }
}

void TextInputNode::setTextInputNodeDelegate(
    TextInputNodeDelegate* textInputNodeDelegate) {
  m_textInputNodeDelegate = textInputNodeDelegate;
}

facebook::react::Point TextInputNode::getTextInputOffset() const {
  auto value = NativeNodeApi::getInstance()
                   ->getAttribute(m_nodeHandle, NODE_OFFSET)
                   ->value;
  facebook::react::Float x = value->i32;
  value++;
  facebook::react::Float y = value->i32;
  return facebook::react::Point{x, y};
}

facebook::react::Rect TextInputNode::getTextContentRect() const {
  auto value = getAttribute(NODE_TEXT_INPUT_CONTENT_RECT).value;
  facebook::react::Float x = value[0].f32;
  facebook::react::Float y = value[1].f32;
  facebook::react::Float width = value[2].f32;
  facebook::react::Float height = value[3].f32;
  return {x, y, width, height};
}

void TextInputNode::setTextContent(std::string const& textContent) {
  ArkUI_AttributeItem item = {.string = textContent.c_str()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_TEXT, &item));
}

void TextInputNode::setSelectedBackgroundColor(
    facebook::react::SharedColor const& color) {
  ArkUI_NumberValue selectedBackgroundColor = {
      .u32 = TextInputNodeBase::convertColorToTranslucentSelection(color)};
  ArkUI_AttributeItem colorItem = {
      &selectedBackgroundColor, sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_SELECTED_BACKGROUND_COLOR, &colorItem));
}

void TextInputNode::setCaretHidden(bool hidden) {
  if (hidden) {
    ArkUI_NumberValue value = {.f32 = 0};
    ArkUI_AttributeItem item = {&value, sizeof(ArkUI_NumberValue)};
    maybeThrow(NativeNodeApi::getInstance()->setAttribute(
        m_nodeHandle, NODE_TEXT_INPUT_CARET_STYLE, &item));
  } else {
    ArkUI_NumberValue value = {
        .f32 = 2}; // The default width of the cursor in ArkUI is 2 vp
    ArkUI_AttributeItem item = {&value, sizeof(ArkUI_NumberValue)};
    maybeThrow(NativeNodeApi::getInstance()->setAttribute(
        m_nodeHandle, NODE_TEXT_INPUT_CARET_STYLE, &item));

    value = {.u32 = m_caretColorValue};
    item = {&value, sizeof(ArkUI_NumberValue)};
    maybeThrow(NativeNodeApi::getInstance()->setAttribute(
        m_nodeHandle, NODE_TEXT_INPUT_CARET_COLOR, &item));
  }
}

void TextInputNode::setInputType(
    facebook::react::KeyboardType rawKeyboardType,
    bool securityEntry) {
  ArkUI_TextInputType keyboardType =
      TextInputNodeBase::convertInputType(rawKeyboardType);
  if (securityEntry) {
    keyboardType = ARKUI_TEXTINPUT_TYPE_PASSWORD;
  }
  ArkUI_NumberValue value = {.i32 = keyboardType};
  ArkUI_AttributeItem item = {&value, sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_TYPE, &item));
}

void TextInputNode::setPasswordIconVisibility(bool isVisible) {
  ArkUI_NumberValue value = {.i32 = isVisible ? 1 : 0};
  ArkUI_AttributeItem item = {&value, sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_SHOW_PASSWORD_ICON, &item));
}

void TextInputNode::setEnterKeyType(
    facebook::react::ReturnKeyType rawReturnKeyType,
    std::string rawReturnKeyLabel) {
  auto returnKeyType = TextInputNodeBase::convertEnterKeyType(rawReturnKeyType);
  if (rawReturnKeyType == facebook::react::ReturnKeyType::Default) {
    returnKeyType = TextInputNodeBase::convertEnterKeyLabel(rawReturnKeyLabel);
  }
  ArkUI_NumberValue value = {.i32 = returnKeyType};
  ArkUI_AttributeItem item = {&value, sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_ENTER_KEY_TYPE, &item));
}

void TextInputNode::setCancelButtonMode(
    facebook::react::TextInputAccessoryVisibilityMode mode) {
  int32_t cancelButtonStyle =
      static_cast<int32_t>(ARKUI_CANCELBUTTON_STYLE_INVISIBLE);
  if (mode == facebook::react::TextInputAccessoryVisibilityMode::Always) {
    cancelButtonStyle = static_cast<int32_t>(ARKUI_CANCELBUTTON_STYLE_CONSTANT);
  } else if (
      mode == facebook::react::TextInputAccessoryVisibilityMode::WhileEditing) {
    cancelButtonStyle = static_cast<int32_t>(ARKUI_CANCELBUTTON_STYLE_INPUT);
  }

  ArkUI_NumberValue value[] = {{.i32 = cancelButtonStyle}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};

  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_CANCEL_BUTTON, &item));
}

void TextInputNode::setFont(
    facebook::react::TextAttributes const& textAttributes,
    float fontSizeScale) {
  TextInputNodeBase::setCommonFontAttributes(textAttributes, fontSizeScale);

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

  bool allowFontScaling = true;
  if (textAttributes.allowFontScaling.has_value()) {
    allowFontScaling = textAttributes.allowFontScaling.value();
  }
  if (!allowFontScaling) {
    fontSize /= fontSizeScale;
  }

  std::array<ArkUI_NumberValue, 3> value = {
      {{.f32 = fontSize},
       {.i32 = static_cast<int32_t>(fontStyle)},
       {.i32 = static_cast<int32_t>(fontWeight)}}};
  ArkUI_AttributeItem item = {value.data(), value.size(), fontFamily.c_str()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_PLACEHOLDER_FONT, &item));
}

void TextInputNode::setLineHeight(float lineHeight) {
  ArkUI_NumberValue value[] = {{.f32 = lineHeight}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_LINE_HEIGHT, &item));
}

void TextInputNode::setCaretColor(facebook::react::SharedColor const& color) {
  uint32_t colorValue = *color;
  m_caretColorValue = *color;
  ArkUI_NumberValue value = {.u32 = colorValue};
  ArkUI_AttributeItem item = {&value, sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_CARET_COLOR, &item));
}

void TextInputNode::setUnderlineColor(
    facebook::react::SharedColor const& underlineColorAndroid) {
  if (*underlineColorAndroid >> 24 == 0) {
    return;
  }
  ArkUI_NumberValue showValue = {.i32 = 1};
  ArkUI_AttributeItem showItem = {&showValue, sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_SHOW_UNDERLINE, &showItem));
  ArkUI_NumberValue value[] = {
      {.u32 = TextInputNodeBase::convertColorToTranslucentUnderline(
           underlineColorAndroid)},
      {.u32 = TextInputNodeBase::convertColorToTranslucentUnderline(
           underlineColorAndroid)},
      {.u32 = TextInputNodeBase::convertColorToTranslucentUnderline(
           underlineColorAndroid)},
      {.u32 = TextInputNodeBase::convertColorToTranslucentUnderline(
           underlineColorAndroid)}};

  ArkUI_AttributeItem item = {
      .value = value, .size = sizeof(value) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_UNDERLINE_COLOR, &item));
}

void TextInputNode::setMaxLength(int32_t maxLength) {
  ArkUI_NumberValue value = {.i32 = maxLength};
  ArkUI_AttributeItem item = {&value, sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_MAX_LENGTH, &item));
}

void TextInputNode::setPlaceholder(std::string const& placeholder) {
  ArkUI_AttributeItem item = {.string = placeholder.c_str()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_PLACEHOLDER, &item));
}

void TextInputNode::setPlaceholderColor(
    facebook::react::SharedColor const& color) {
  uint32_t colorValue = *color;
  ArkUI_NumberValue value = {.u32 = colorValue};
  ArkUI_AttributeItem item = {&value, sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_PLACEHOLDER_COLOR, &item));
}

void TextInputNode::resetSelectedBackgroundColor() {
  maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_SELECTED_BACKGROUND_COLOR));
}

void TextInputNode::setTextContentType(std::string const& textContentType) {
  ArkUI_NumberValue type =
      TextInputNodeBase::convertContentType(textContentType);
  if (type.i32 == -1) {
    return;
  }
  std::array<ArkUI_NumberValue, 1> value = {type};
  ArkUI_AttributeItem item = {value.data(), value.size()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_CONTENT_TYPE, &item));
}

void TextInputNode::setAutoFill(bool autoFill) {
  uint32_t isAutoFill = static_cast<uint32_t>(autoFill);
  ArkUI_NumberValue value = {.u32 = isAutoFill};
  ArkUI_AttributeItem item = {&value, sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_ENABLE_AUTO_FILL, &item));
}

void TextInputNode::setBlurOnSubmit(bool blurOnSubmit) {
  ArkUI_NumberValue value = {.i32 = int32_t(blurOnSubmit)};
  ArkUI_AttributeItem item = {&value, 1};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_BLUR_ON_SUBMIT, &item));
}

void TextInputNode::setShowKeyboardOnFocus(bool enable) {
  ArkUI_NumberValue value = {.i32 = int32_t(enable)};
  ArkUI_AttributeItem item = {&value, 1};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_SHOW_KEYBOARD_ON_FOCUS, &item));
}

void TextInputNode::setInputFilter(const std::string& inputFilter) {
  ArkUI_AttributeItem item = {.string = inputFilter.c_str()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_INPUT_FILTER, &item));
}

std::string TextInputNode::getTextContent() {
  auto item = NativeNodeApi::getInstance()->getAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_TEXT);
  return item->string;
}

void TextInputNode::setContextMenuHidden(bool hidden) {
  std::array<ArkUI_NumberValue, 1> value = {
      {{.i32 = static_cast<int32_t>(hidden)}}};
  ArkUI_AttributeItem item = {value.data(), value.size()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_SELECTION_MENU_HIDDEN, &item));
}

void TextInputNode::setPasswordRules(const std::string rules) {
  ArkUI_AttributeItem item = {.string = rules.c_str()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_PASSWORD_RULES, &item));
}

} // namespace rnoh
