#pragma once

#include <arkui/native_type.h>
#include <bits/alltypes.h>
#include <glog/logging.h>
#include "react/renderer/attributedstring/primitives.h"
#include "react/renderer/components/textinput/primitives.h"
#include "react/renderer/components/view/primitives.h"

namespace rnoh {
/**
 * @api
 */
inline ArkUI_BorderStyle convertReactBorderStyleToArk(
    facebook::react::BorderStyle rnBorder) {
  switch (rnBorder) {
    case facebook::react::BorderStyle::Solid:
      return ArkUI_BorderStyle::ARKUI_BORDER_STYLE_SOLID;
    case facebook::react::BorderStyle::Dotted:
      return ArkUI_BorderStyle::ARKUI_BORDER_STYLE_DOTTED;
    case facebook::react::BorderStyle::Dashed:
      return ArkUI_BorderStyle::ARKUI_BORDER_STYLE_DASHED;
    default:
      LOG(WARNING) << "Invalid BorderStyle";
      return ArkUI_BorderStyle::ARKUI_BORDER_STYLE_SOLID;
  }
}

/**
 * @api
 */
inline ArkUI_TextAreaType convertTextAreaInputType(
    facebook::react::KeyboardType keyboardType) {
  switch (keyboardType) {
    case facebook::react::KeyboardType::DecimalPad:
    case facebook::react::KeyboardType::Numeric:
    case facebook::react::KeyboardType::NumberPad:
      return ARKUI_TEXTAREA_TYPE_NUMBER;
    case facebook::react::KeyboardType::PhonePad:
      return ARKUI_TEXTAREA_TYPE_PHONE_NUMBER;
    case facebook::react::KeyboardType::EmailAddress:
      return ARKUI_TEXTAREA_TYPE_EMAIL;
    default:
      return ARKUI_TEXTAREA_TYPE_NORMAL;
  }
}

/**
 * @api
 */
inline uint32_t convertColorToTranslucent(
    facebook::react::SharedColor const& color) {
  auto colorComponents = colorComponentsFromColor(color);
  uint32_t red = static_cast<uint32_t>(colorComponents.red * 255) & 0xFF;
  uint32_t green = static_cast<uint32_t>(colorComponents.green * 255) & 0xFF;
  uint32_t blue = static_cast<uint32_t>(colorComponents.blue * 255) & 0xFF;
  uint32_t alpha = 0x55;
  auto colorValue = (alpha << 24) | (red << 16) | (green << 8) | blue;
  return colorValue;
}

/**
 * @api
 */
inline ArkUI_TextInputType convertInputType(
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

/**
 * @api
 */
inline ArkUI_EnterKeyType convertEnterKeyType(
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

/**
 * @api
 */
inline ArkUI_TextAlignment convertTextAlign(
    facebook::react::TextAlignment alignment) {
  switch (alignment) {
    case facebook::react::TextAlignment::Natural:
    case facebook::react::TextAlignment::Left:
      return ARKUI_TEXT_ALIGNMENT_START;
    case facebook::react::TextAlignment::Right:
      return ARKUI_TEXT_ALIGNMENT_END;
    case facebook::react::TextAlignment::Center:
      return ARKUI_TEXT_ALIGNMENT_CENTER;
    case facebook::react::TextAlignment::Justified:
      return ARKUI_TEXT_ALIGNMENT_JUSTIFY;
    default:
      return ARKUI_TEXT_ALIGNMENT_START;
  }
}

/**
 * @api
 */
inline ArkUI_FontWeight convertFontWeight(
    facebook::react::FontWeight fontWeight) {
  auto fontWeightInt = static_cast<int32_t>(fontWeight);
  if (fontWeightInt < 200) {
    return ARKUI_FONT_WEIGHT_W100;
  }
  if (fontWeightInt < 300) {
    return ARKUI_FONT_WEIGHT_W200;
  }
  if (fontWeightInt < 400) {
    return ARKUI_FONT_WEIGHT_W300;
  }
  if (fontWeightInt < 500) {
    return ARKUI_FONT_WEIGHT_W400;
  }
  if (fontWeightInt < 600) {
    return ARKUI_FONT_WEIGHT_W500;
  }
  if (fontWeightInt < 700) {
    return ARKUI_FONT_WEIGHT_W600;
  }
  if (fontWeightInt < 800) {
    return ARKUI_FONT_WEIGHT_W700;
  }
  if (fontWeightInt < 900) {
    return ARKUI_FONT_WEIGHT_W800;
  }
  return ARKUI_FONT_WEIGHT_W900;
}

/**
 * @api
 */
inline ArkUI_TextInputContentType convertContentType(
    std::string const& textContentType) {
  if (textContentType == "addressCity") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_CITY_ADDRESS;
  } else if (textContentType == "addressState") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_PROVINCE_ADDRESS;
  } else if (textContentType == "countryName") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_COUNTRY_ADDRESS;
  } else if (textContentType == "creditCardNumber") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_BANK_CARD_NUMBER;
  } else if (textContentType == "fullStreetAddress") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_FULL_STREET_ADDRESS;
  } else if (textContentType == "sublocality") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_DISTRICT_ADDRESS;
  } else if (textContentType == "telephoneNumber") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_PHONE_NUMBER;
  } else if (textContentType == "username") {
    return ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_USER_NAME;
  } else if (textContentType == "password") {
    return ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_PASSWORD;
  } else if (textContentType == "newPassword") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_NEW_PASSWORD;
  } else if (textContentType == "houseNumber") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_HOUSE_NUMBER;
  } else if (textContentType == "districtAddress") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_DISTRICT_ADDRESS;
  } else if (textContentType == "cityAddress") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_CITY_ADDRESS;
  } else if (textContentType == "provinceAddress") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_PROVINCE_ADDRESS;
  } else if (textContentType == "countryAddress") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_COUNTRY_ADDRESS;
  } else if (textContentType == "personFullName") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_FULL_NAME;
  } else if (textContentType == "personLastName") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_LAST_NAME;
  } else if (textContentType == "personFirstName") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_FIRST_NAME;
  } else if (textContentType == "phoneNumber") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_PHONE_NUMBER;
  } else if (textContentType == "phoneCountryCode") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_PHONE_COUNTRY_CODE;
  } else if (textContentType == "fullPhoneNumber") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_FULL_PHONE_NUMBER;
  } else if (textContentType == "emailAddress") {
    return ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_EMAIL_ADDRESS;
  } else if (textContentType == "bankCardNumber") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_BANK_CARD_NUMBER;
  } else if (textContentType == "idCardNumber") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_ID_CARD_NUMBER;
  } else if (textContentType == "nickName") {
    return ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_NICKNAME;
  } else if (textContentType == "name") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_FULL_NAME;
  } else if (textContentType == "familyName") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_LAST_NAME;
  } else if (textContentType == "givenName") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_FIRST_NAME;
  } else if (textContentType == "detailInfoWithoutStreet") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_DETAIL_INFO_WITHOUT_STREET;
  } else if (textContentType == "formatAddress") {
    return ArkUI_TextInputContentType::
        ARKUI_TEXTINPUT_CONTENT_TYPE_FORMAT_ADDRESS;
  } else if (textContentType == "none") {
    return static_cast<ArkUI_TextInputContentType>(-1);
  } else {
    return static_cast<ArkUI_TextInputContentType>(-2);
  }
}
} // namespace rnoh
