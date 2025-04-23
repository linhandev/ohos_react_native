/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include "ArkUINode.h"
#include "react/renderer/components/textinput/TextInputProps.h"
#include "react/renderer/graphics/Color.h"

/**
 * TextInput_TextContentType is defined to replace
 * ArkUI_TextInputContentType. Directly using enum from IDE SDK may raise
 * compiling error when developer use lower IDE SDK version that does not
 * contain new supported type.
 * @internal
 * @deprecated: This enum is no longer part of the native API. Deprecated when
 * preparing the 0.77 branch for release.
 */
typedef enum {
  USER_NAME,
  PASSWORD,
  NEW_PASSWORD,
  FULL_STREET_ADDRESS,
  HOUSE_NUMBER,
  DISTRICT_ADDRESS,
  CITY_ADDRESS,
  PROVINCE_ADDRESS,
  COUNTRY_ADDRESS,
  PERSON_FULL_NAME,
  PERSON_LAST_NAME,
  PERSON_FIRST_NAME,
  PHONE_NUMBER,
  PHONE_COUNTRY_CODE,
  FULL_PHONE_NUMBER,
  EMAIL_ADDRESS,
  BANK_CARD_NUMBER,
  ID_CARD_NUMBER,
  NICKNAME,
  DETAIL_INFO_WITHOUT_STREET,
  FORMAT_ADDRESS,
  PASSPORT_NUMBER,
  VALIDITY,
  ISSUE_AT,
  ORGANIZATION,
  TAX_ID,
  ADDRESS_CITY_AND_STATE,
  FLIGHT_NUMBER,
  LICENSE_NUMBER,
  LICENSE_FILE_NUMBER,
  LICENSE_PLATE,
  ENGINE_NUMBER,
  LICENSE_CHASSIS_NUMBER,

} TextInput_TextContentType;

namespace rnoh {

/**
 * @api
 */
class TextInputNodeBase : public ArkUINode {
 protected:
  TextInputNodeBase(ArkUI_NodeType nodeType);
  void setCommonFontAttributes(
      facebook::react::TextAttributes const& textAttributes);

 public:
  void setPadding(
      facebook::react::RectangleEdges<facebook::react::Float> padding);

  void setFocusable(bool const& focusable);

  void setAutoFocus(bool autoFocus);

  void setResponseRegion(
      facebook::react::Point const& position,
      facebook::react::Size const& size);

  void setTextContent(std::string const& textContent);

  void setTextSelection(int32_t start, int32_t end);

  void setFontColor(facebook::react::SharedColor const& color);

  virtual void setFont(
      facebook::react::TextAttributes const& textAttributes) = 0;

  virtual void setCaretColor(facebook::react::SharedColor const& color) = 0;

  virtual void setMaxLength(int32_t maxLength) = 0;

  virtual void setPlaceholder(std::string const& placeholder) = 0;

  virtual void setPlaceholderColor(
      facebook::react::SharedColor const& color) = 0;

  void setTextInputLineHeight(
      facebook::react::TextAttributes const& textAttributes);

  void setTextAlign(
      std::optional<facebook::react::TextAlignment> const& textAlign);

  std::string virtual getTextContent() = 0;

  virtual facebook::react::Rect getTextContentRect() const = 0;
  /**
   * @internal
   */
  static uint32_t convertColorToTranslucentUnderline(
      facebook::react::SharedColor const& color);
  /**
   * @internal
   */
  static uint32_t convertColorToTranslucentSelection(
      facebook::react::SharedColor const& color);
  /**
   * @internal
   */
  static ArkUI_NumberValue convertContentType(
      std::string const& textContentType);
  /**
   * @internal
   */
  static ArkUI_EnterKeyType convertEnterKeyType(
      facebook::react::ReturnKeyType returnKeyType);
  /**
   * @internal
   */
  static ArkUI_EnterKeyType convertEnterKeyLabel(std::string returnKeyLabel);
  /**
   * @internal
   */
  static ArkUI_TextInputType convertInputType(
      facebook::react::KeyboardType keyboardType);
};

} // namespace rnoh