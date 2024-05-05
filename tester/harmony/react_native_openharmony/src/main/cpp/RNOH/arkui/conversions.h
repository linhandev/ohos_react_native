#pragma once

#include <arkui/native_type.h>
#include <bits/alltypes.h>
#include <glog/logging.h>
#include "react/renderer/attributedstring/primitives.h"
#include "react/renderer/components/textinput/primitives.h"
#include "react/renderer/components/view/primitives.h"

namespace rnoh {
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

inline ArkUI_TextAreaType convertTextAreaInputType(
    facebook::react::KeyboardType keyboardType) {
  switch (keyboardType) {
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

inline ArkUI_EnterKeyType convertEnterKeyLabel(
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

inline ArkUI_NumberValue convertTextAlign(
    facebook::react::TextAlignment alignment) {
  switch (alignment) {
    case facebook::react::TextAlignment::Natural:
    case facebook::react::TextAlignment::Left:
      return {.i32 = static_cast<int32_t>(ARKUI_TEXT_ALIGNMENT_START)};
    case facebook::react::TextAlignment::Right:
      return {.i32 = static_cast<int32_t>(ARKUI_TEXT_ALIGNMENT_END)};
    case facebook::react::TextAlignment::Center:
      return {.i32 = static_cast<int32_t>(ARKUI_TEXT_ALIGNMENT_CENTER)};
    case facebook::react::TextAlignment::Justified:
      return {.i32 = static_cast<int32_t>(ARKUI_TEXT_ALIGNMENT_JUSTIFY)};
    default:
      return {.i32 = static_cast<int32_t>(ARKUI_TEXT_ALIGNMENT_START)};
  }
}

inline ArkUI_NumberValue convertFontWeight(int fontWeight) {
  if (fontWeight < 200) {
    return {.i32 = ARKUI_FONT_WEIGHT_W100};
  }
  if (fontWeight < 300) {
    return {.i32 = ARKUI_FONT_WEIGHT_W200};
  }
  if (fontWeight < 400) {
    return {.i32 = ARKUI_FONT_WEIGHT_W300};
  }
  if (fontWeight < 500) {
    return {.i32 = ARKUI_FONT_WEIGHT_W400};
  }
  if (fontWeight < 600) {
    return {.i32 = ARKUI_FONT_WEIGHT_W500};
  }
  if (fontWeight < 700) {
    return {.i32 = ARKUI_FONT_WEIGHT_W600};
  }
  if (fontWeight < 800) {
    return {.i32 = ARKUI_FONT_WEIGHT_W700};
  }
  if (fontWeight < 900) {
    return {.i32 = ARKUI_FONT_WEIGHT_W800};
  }
  return {.i32 = ARKUI_FONT_WEIGHT_W900};
}
inline ArkUI_NumberValue convertContentType(std::string const& textContentType){
    if (textContentType == "addressCity") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_CITY_ADDRESS};
} else if (textContentType == "addressState") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_PROVINCE_ADDRESS};
} else if (textContentType == "countryName") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_COUNTRY_ADDRESS};
} else if (textContentType == "creditCardNumber") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_BANK_CARD_NUMBER};
} else if (textContentType == "fullStreetAddress") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_FULL_STREET_ADDRESS};
} else if (textContentType == "sublocality") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_DISTRICT_ADDRESS};
} else if (textContentType == "telephoneNumber") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_PHONE_NUMBER};
}else if (textContentType == "username") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_USER_NAME};
} else if (textContentType == "password") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_PASSWORD};
} else if (textContentType == "newPassword") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_NEW_PASSWORD};
} else if (textContentType == "houseNumber") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_HOUSE_NUMBER};
} else if (textContentType == "districtAddress") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_DISTRICT_ADDRESS};
} else if (textContentType == "cityAddress") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_CITY_ADDRESS};
} else if (textContentType == "provinceAddress") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_PROVINCE_ADDRESS};
} else if (textContentType == "countryAddress") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_COUNTRY_ADDRESS};
} else if (textContentType == "personFullName") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_FULL_NAME};
} else if (textContentType == "personLastName") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_LAST_NAME};
} else if (textContentType == "personFirstName") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_PERSON_FIRST_NAME};
} else if (textContentType == "phoneNumber") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_PHONE_NUMBER};
} else if (textContentType == "phoneCountryCode") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_PHONE_COUNTRY_CODE};
} else if (textContentType == "fullPhoneNumber") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_FULL_PHONE_NUMBER};
} else if (textContentType == "emailAddress") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_EMAIL_ADDRESS};
} else if (textContentType == "bankCardNumber") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_BANK_CARD_NUMBER};
} else if (textContentType == "idCardNumber") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_ID_CARD_NUMBER};
} else if (textContentType == "nickName") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_NICKNAME};
} else if (textContentType == "detailInfoWithoutStreet") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_DETAIL_INFO_WITHOUT_STREET};
} else if (textContentType == "formatAddress") {
    return {.i32 = ArkUI_TextInputContentType::ARKUI_TEXTINPUT_CONTENT_TYPE_FORMAT_ADDRESS};
}else{
    return {.i32 = -1};
}
}

inline bool convertImportantForAutofill(
  std::string const& autoFill) {
  auto string = (std::string)autoFill;
  if (string == "no" || string == "noExcludeDescendants"
    || string == "auto") {
    return false;
  } else if (string == "yes" || string == "yesExcludeDescendants") {
    return true;
  } else {
    LOG(WARNING) << "Invalid ImportantForAutofill";
    return true;
  }
}
} // namespace rnoh
