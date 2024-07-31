#include "TextInputNodeBase.h"
#include "NativeNodeApi.h"
#include "RNOH/arkui/conversions.h"

namespace rnoh {

TextInputNodeBase::TextInputNodeBase(ArkUI_NodeType nodeType)
    : ArkUINode(NativeNodeApi::getInstance()->createNode(nodeType)) {}

ArkUI_TextInputType TextInputNodeBase::convertInputType(
    facebook::react::KeyboardType keyboardType) {
  switch (keyboardType) {
    case facebook::react::KeyboardType::Numeric:
    case facebook::react::KeyboardType::NumberPad:
      return ARKUI_TEXTINPUT_TYPE_NUMBER;
    case facebook::react::KeyboardType::DecimalPad:
      return ARKUI_TEXTINPUT_TYPE_NUMBER_DECIMAL;
    case facebook::react::KeyboardType::PhonePad:
      return ARKUI_TEXTINPUT_TYPE_PHONE_NUMBER;
    case facebook::react::KeyboardType::EmailAddress:
      return ARKUI_TEXTINPUT_TYPE_EMAIL;
    default:
      return ARKUI_TEXTINPUT_TYPE_NORMAL;
  }
}

ArkUI_EnterKeyType TextInputNodeBase::convertEnterKeyType(
    facebook::react::ReturnKeyType returnKeyType) {
  switch (returnKeyType) {
    case facebook::react::ReturnKeyType::Done:
      return ARKUI_ENTER_KEY_TYPE_DONE;
    case facebook::react::ReturnKeyType::Go:
      return ARKUI_ENTER_KEY_TYPE_GO;
    case facebook::react::ReturnKeyType::Next:
      return ARKUI_ENTER_KEY_TYPE_NEXT;
    case facebook::react::ReturnKeyType::Search:
      return ARKUI_ENTER_KEY_TYPE_SEARCH;
    case facebook::react::ReturnKeyType::Send:
      return ARKUI_ENTER_KEY_TYPE_SEND;
    default:
      return ARKUI_ENTER_KEY_TYPE_DONE;
  }
}

ArkUI_EnterKeyType TextInputNodeBase::convertEnterKeyLabel(
    std::string returnKeyLabel) {
  if (!returnKeyLabel.compare("done")) {
    return ARKUI_ENTER_KEY_TYPE_DONE;
  } else if (!returnKeyLabel.compare("go")) {
    return ARKUI_ENTER_KEY_TYPE_GO;
  } else if (!returnKeyLabel.compare("next")) {
    return ARKUI_ENTER_KEY_TYPE_NEXT;
  } else if (!returnKeyLabel.compare("search")) {
    return ARKUI_ENTER_KEY_TYPE_SEARCH;
  } else if (!returnKeyLabel.compare("send")) {
    return ARKUI_ENTER_KEY_TYPE_SEND;
  } else {
    return ARKUI_ENTER_KEY_TYPE_DONE;
  }
}

ArkUI_NumberValue TextInputNodeBase::convertContentType(
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

uint32_t TextInputNodeBase::convertColorToTranslucentUnderline(
    facebook::react::SharedColor const& color) {
  auto colorComponents = colorComponentsFromColor(color);
  uint32_t red = static_cast<uint32_t>(colorComponents.red * 255) & 0xFF;
  uint32_t green = static_cast<uint32_t>(colorComponents.green * 255) & 0xFF;
  uint32_t blue = static_cast<uint32_t>(colorComponents.blue * 255) & 0xFF;
  uint32_t alpha = static_cast<uint32_t>(colorComponents.alpha * 255) & 0xFF;
  auto colorValue = (alpha << 24) | (red << 16) | (green << 8) | blue;
  return colorValue;
}

uint32_t TextInputNodeBase::convertColorToTranslucentSelection(
    facebook::react::SharedColor const& color) {
  auto colorComponents = colorComponentsFromColor(color);
  uint32_t red = static_cast<uint32_t>(colorComponents.red * 255) & 0xFF;
  uint32_t green = static_cast<uint32_t>(colorComponents.green * 255) & 0xFF;
  uint32_t blue = static_cast<uint32_t>(colorComponents.blue * 255) & 0xFF;
  uint32_t alpha = 0x55;
  auto colorValue = (alpha << 24) | (red << 16) | (green << 8) | blue;
  return colorValue;
}

void TextInputNodeBase::setPadding(
    facebook::react::RectangleEdges<facebook::react::Float> padding) {
  std::array<ArkUI_NumberValue, 4> value = {
      static_cast<float>(padding.top),
      static_cast<float>(padding.right),
      static_cast<float>(padding.bottom),
      static_cast<float>(padding.left)};
  ArkUI_AttributeItem item = {value.data(), value.size()};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_PADDING, &item));
}

void TextInputNodeBase::setFocusable(bool const& focusable) {
  int32_t focusableValue = 1;
  if (!focusable) {
    focusableValue = 0;
  }
  ArkUI_NumberValue value[] = {{.i32 = focusableValue}};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_FOCUSABLE, &item));
}

void TextInputNodeBase::setAutoFocus(bool autoFocus) {
  ArkUI_NumberValue value = {.i32 = static_cast<int32_t>(autoFocus)};
  ArkUI_AttributeItem item = {&value, 1};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_FOCUS_STATUS, &item));
}

void TextInputNodeBase::setResponseRegion(
    facebook::react::Point const& position,
    facebook::react::Size const& size) {
  ArkUI_NumberValue value[] = {
      0.0f, 0.0f, (float)size.width, (float)size.height};
  ArkUI_AttributeItem item = {value, sizeof(value) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_RESPONSE_REGION, &item));
}

void TextInputNodeBase::setFontColor(
    facebook::react::SharedColor const& color) {
  uint32_t colorValue = *color;
  ArkUI_NumberValue preparedColorValue[] = {{.u32 = colorValue}};
  ArkUI_AttributeItem colorItem = {
      preparedColorValue,
      sizeof(preparedColorValue) / sizeof(ArkUI_NumberValue)};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_FONT_COLOR, &colorItem));
}

void TextInputNodeBase::setTextInputLineHeight(
    facebook::react::TextAttributes const& textAttributes,
    float fontSizeScale) {
  bool allowFontScaling = true;
  if (textAttributes.allowFontScaling.has_value()) {
    allowFontScaling = textAttributes.allowFontScaling.value();
  }
  float lineHeight = static_cast<float>(textAttributes.lineHeight);
  if (!allowFontScaling) {
    lineHeight /= fontSizeScale;
  }
  ArkUI_NumberValue value[] = {{.f32 = lineHeight}};
  ArkUI_AttributeItem item = {.value = value, .size = 1};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_LINE_HEIGHT, &item));
}

void TextInputNodeBase::setCommonFontAttributes(
    facebook::react::TextAttributes const& textAttributes,
    float fontSizeScale) {
  if (textAttributes.fontFamily.empty()) {
    maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
        m_nodeHandle, NODE_FONT_FAMILY));
  } else {
    ArkUI_AttributeItem item = {.string = textAttributes.fontFamily.c_str()};
    maybeThrow(NativeNodeApi::getInstance()->setAttribute(
        m_nodeHandle, NODE_FONT_FAMILY, &item));
  }

  if (std::isnan(textAttributes.fontSize)) {
    maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
        m_nodeHandle, NODE_FONT_SIZE));
  } else {
    bool allowFontScaling = true;
    if (textAttributes.allowFontScaling.has_value()) {
      allowFontScaling = textAttributes.allowFontScaling.value();
    }

    float fontSize = static_cast<float>(textAttributes.fontSize);
    if (!allowFontScaling) {
      fontSize /= fontSizeScale;
    }
    std::array<ArkUI_NumberValue, 1> value = {{{.f32 = fontSize}}};
    ArkUI_AttributeItem item = {value.data(), value.size()};
    maybeThrow(NativeNodeApi::getInstance()->setAttribute(
        m_nodeHandle, NODE_FONT_SIZE, &item));
  }

  if (textAttributes.fontWeight.has_value()) {
    std::array<ArkUI_NumberValue, 1> value = {
        {{.i32 = static_cast<int32_t>(
              rnoh::convertFontWeight(textAttributes.fontWeight.value()))}}};
    ArkUI_AttributeItem item = {value.data(), value.size()};
    maybeThrow(NativeNodeApi::getInstance()->setAttribute(
        m_nodeHandle, NODE_FONT_WEIGHT, &item));
  } else {
    maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
        m_nodeHandle, NODE_FONT_WEIGHT));
  }

  if (textAttributes.fontStyle.has_value() &&
      textAttributes.fontStyle.value() == facebook::react::FontStyle::Italic) {
    std::array<ArkUI_NumberValue, 1> value = {
        {{.i32 = static_cast<int32_t>(ARKUI_FONT_STYLE_ITALIC)}}};
    ArkUI_AttributeItem item = {value.data(), value.size()};
    maybeThrow(NativeNodeApi::getInstance()->setAttribute(
        m_nodeHandle, NODE_FONT_STYLE, &item));
  } else {
    maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
        m_nodeHandle, NODE_FONT_STYLE));
  }
}

void TextInputNodeBase::setTextAlign(
    std::optional<facebook::react::TextAlignment> const& textAlign) {
  if (textAlign.has_value()) {
    std::array<ArkUI_NumberValue, 1> value = {
        {{.i32 = static_cast<int32_t>(
              rnoh::convertTextAlign(textAlign.value()))}}};
    ArkUI_AttributeItem item = {value.data(), value.size()};
    maybeThrow(NativeNodeApi::getInstance()->setAttribute(
        m_nodeHandle, NODE_TEXT_ALIGN, &item));
  } else {
    maybeThrow(NativeNodeApi::getInstance()->resetAttribute(
        m_nodeHandle, NODE_TEXT_ALIGN));
  }
}

void TextInputNodeBase::setTextSelection(int32_t start, int32_t end) {
  std::array<ArkUI_NumberValue, 2> value = {{{.i32 = start}, {.i32 = end}}};
  ArkUI_AttributeItem item = {.value = value.data(), .size = 2};
  maybeThrow(NativeNodeApi::getInstance()->setAttribute(
      m_nodeHandle, NODE_TEXT_INPUT_TEXT_SELECTION, &item));
}
} // namespace rnoh
