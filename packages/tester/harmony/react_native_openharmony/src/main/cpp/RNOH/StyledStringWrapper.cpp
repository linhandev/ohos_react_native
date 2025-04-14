/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "StyledStringWrapper.h"
#include <native_drawing/drawing_point.h>
#include <native_drawing/drawing_text_typography.h>
#include <native_drawing/drawing_types.h>
#include "react/renderer/graphics/Color.h"
#include "react/renderer/graphics/Size.h"

namespace rnoh {

OH_Drawing_FontWeight mapValueToFontWeight(int value) {
  switch (value) {
    case 100:
      return OH_Drawing_FontWeight::FONT_WEIGHT_100;
    case 200:
      return OH_Drawing_FontWeight::FONT_WEIGHT_200;
    case 300:
      return OH_Drawing_FontWeight::FONT_WEIGHT_300;
    case 400:
      return OH_Drawing_FontWeight::FONT_WEIGHT_400;
    case 500:
      return OH_Drawing_FontWeight::FONT_WEIGHT_500;
    case 600:
      return OH_Drawing_FontWeight::FONT_WEIGHT_600;
    case 700:
      return OH_Drawing_FontWeight::FONT_WEIGHT_700;
    case 800:
      return OH_Drawing_FontWeight::FONT_WEIGHT_800;
    case 900:
      return OH_Drawing_FontWeight::FONT_WEIGHT_900;
    default:
      return OH_Drawing_FontWeight::FONT_WEIGHT_400;
  }
}

size_t utf8Length(const std::string& str) {
  size_t length = 0;
  for (auto c : str) {
    if ((c & 0x80) == 0 || (c & 0xc0) == 0xc0) {
      length++;
    }
  }
  return length;
}

std::string stringCapitalize(const std::string& strInput) {
  if (strInput.empty()) {
    return strInput;
  }

  std::string strRes;
  std::string split = " ";
  std::vector<std::string> subStringVector;
  subStringVector.clear();

  std::string strSrc = strInput + split;
  auto pos = strSrc.find(split);
  auto step = split.size();

  while (pos != std::string::npos) {
    std::string strTemp = strSrc.substr(0, pos);
    subStringVector.push_back(strTemp);

    strSrc = strSrc.substr(pos + step, strSrc.size());
    pos = strSrc.find(split);
  }

  for (auto subString : subStringVector) {
    if (std::isalpha(subString[0]) != 0) {
      std::transform(
          subString.begin(), subString.end(), subString.begin(), ::tolower);
      subString[0] = std::toupper(static_cast<unsigned char>(subString[0]));
    }
    if (!strRes.empty()) {
      strRes += split;
    }
    strRes += subString;
  }
  return strRes;
}

void textCaseTransform(
    std::string& textContent,
    facebook::react::TextTransform type) {
  switch (type) {
    case facebook::react::TextTransform::Uppercase: {
      transform(
          textContent.begin(),
          textContent.end(),
          textContent.begin(),
          ::toupper);
      break;
    }
    case facebook::react::TextTransform::Lowercase: {
      transform(
          textContent.begin(),
          textContent.end(),
          textContent.begin(),
          ::tolower);
      break;
    }
    case facebook::react::TextTransform::Capitalize: {
      textContent = stringCapitalize(textContent);
      break;
    }
    default:
      break;
  }
}
void StyledStringWrapper::addTextFragment(
    const facebook::react::AttributedString::Fragment& fragment) {
  UniqueTextStyle textStyle(
      OH_Drawing_CreateTextStyle(), OH_Drawing_DestroyTextStyle);

  auto fontSize = fragment.textAttributes.fontSize;
  if (fontSize <= 0) {
    // set fontSize to default for negative values(same as iOS)
    fontSize = 14;
  }

  OH_Drawing_SetTextStyleFontSize(
      textStyle.get(), fontSize * m_scale * m_fontMultiplier);

  // halfLeading
  if (!isnan(fragment.textAttributes.lineHeight)) {
    OH_Drawing_SetTextStyleHalfLeading(
        textStyle.get(), fragment.textAttributes.lineHeight > fontSize);
  }

  // fontStyle
  if (fragment.textAttributes.fontStyle.has_value()) {
    OH_Drawing_SetTextStyleFontStyle(
        textStyle.get(), (int)fragment.textAttributes.fontStyle.value());
  }

  // fontColor
  if (fragment.textAttributes.foregroundColor) {
    OH_Drawing_SetTextStyleColor(
        textStyle.get(), (uint32_t)(*fragment.textAttributes.foregroundColor));
  }

  // textDecoration
  int32_t textDecorationType = TEXT_DECORATION_NONE;
  uint32_t textDecorationColor = 0xFF000000;
  int32_t textDecorationStyle = TEXT_DECORATION_STYLE_SOLID;
  if (fragment.textAttributes.textDecorationLineType.has_value()) {
    textDecorationType =
        (int32_t)fragment.textAttributes.textDecorationLineType.value();
    if (fragment.textAttributes.textDecorationColor) {
      textDecorationColor =
          (uint32_t)(*fragment.textAttributes.textDecorationColor);
    } else if (fragment.textAttributes.foregroundColor) {
      textDecorationColor =
          (uint32_t)(*fragment.textAttributes.foregroundColor);
    }
    if (textDecorationType ==
            (int32_t)facebook::react::TextDecorationLineType::Strikethrough ||
        textDecorationType ==
            (int32_t)facebook::react::TextDecorationLineType::
                UnderlineStrikethrough) {
      textDecorationType = TEXT_DECORATION_LINE_THROUGH;
    }
  }
  if (fragment.textAttributes.textDecorationStyle.has_value()) {
    textDecorationStyle =
        (int32_t)fragment.textAttributes.textDecorationStyle.value();
  }
  OH_Drawing_SetTextStyleDecoration(textStyle.get(), textDecorationType);
  OH_Drawing_SetTextStyleDecorationColor(textStyle.get(), textDecorationColor);
  OH_Drawing_SetTextStyleDecorationStyle(textStyle.get(), textDecorationStyle);

  // backgroundColor
  std::unique_ptr<OH_Drawing_Brush, decltype(&OH_Drawing_BrushDestroy)> brush(
      OH_Drawing_BrushCreate(), OH_Drawing_BrushDestroy);
  if (fragment.textAttributes.isHighlighted.has_value() &&
      fragment.textAttributes.isHighlighted.value()) {
    OH_Drawing_BrushSetColor(brush.get(), (uint32_t)0xFF80808080);
    OH_Drawing_SetTextStyleBackgroundBrush(textStyle.get(), brush.get());
  } else if (fragment.textAttributes.backgroundColor) {
    OH_Drawing_BrushSetColor(
        brush.get(), (uint32_t)(*fragment.textAttributes.backgroundColor));
    OH_Drawing_SetTextStyleBackgroundBrush(textStyle.get(), brush.get());
  }

  // shadow
  if (facebook::react::isColorMeaningful(
          fragment.textAttributes.textShadowColor)) {
    std::unique_ptr<
        OH_Drawing_TextShadow,
        decltype(&OH_Drawing_DestroyTextShadow)>
        shadow(OH_Drawing_CreateTextShadow(), OH_Drawing_DestroyTextShadow);
    auto color = *fragment.textAttributes.textShadowColor;
    auto radius = fragment.textAttributes.textShadowRadius;
    auto offset = fragment.textAttributes.textShadowOffset.value_or(
        facebook::react::Size{0., 0.});
    std::unique_ptr<OH_Drawing_Point, decltype(&OH_Drawing_PointDestroy)>
        offsetPoint(
            OH_Drawing_PointCreate(
                offset.width * m_scale, offset.height * m_scale),
            OH_Drawing_PointDestroy);

    OH_Drawing_SetTextShadow(shadow.get(), color, offsetPoint.get(), radius);
    OH_Drawing_TextStyleAddShadow(textStyle.get(), shadow.get());
  }

  // new NDK for setting letterSpacing
  if (!isnan(fragment.textAttributes.letterSpacing)) {
    OH_Drawing_SetTextStyleLetterSpacing(
        textStyle.get(), fragment.textAttributes.letterSpacing);
  }
  if (!isnan(fragment.textAttributes.lineHeight) &&
      fragment.textAttributes.lineHeight > 0) {
    // fontSize * fontHeight = lineHeight, no direct ndk for setting
    // lineHeight so do it in this weird way
    double fontHeight = fragment.textAttributes.lineHeight / fontSize;
    OH_Drawing_SetTextStyleFontHeight(textStyle.get(), fontHeight);
  }
  if (fragment.textAttributes.fontWeight.has_value()) {
    OH_Drawing_SetTextStyleFontWeight(
        textStyle.get(),
        mapValueToFontWeight(int(fragment.textAttributes.fontWeight.value())));
  }

  // fontFamily
  std::vector<const char*> fontFamilies;
  if (!m_themeFontFamilyName.empty()) {
    fontFamilies.emplace_back(m_themeFontFamilyName.c_str());
  }
  if (!fragment.textAttributes.fontFamily.empty()) {
    fontFamilies.emplace_back(fragment.textAttributes.fontFamily.c_str());
  }
  if (fontFamilies.size() > 0) {
    OH_Drawing_SetTextStyleFontFamilies(
        textStyle.get(), fontFamilies.size(), fontFamilies.data());
  }

  if (fragment.textAttributes.fontVariant.has_value()) {
    auto fontVariant = int(fragment.textAttributes.fontVariant.value());

    OH_Drawing_TextStyleAddFontFeature(
        textStyle.get(),
        "smcp",
        static_cast<int>((fontVariant & (int)FontVariant::SmallCaps) != 0));

    OH_Drawing_TextStyleAddFontFeature(
        textStyle.get(),
        "onum",
        static_cast<int>((fontVariant & (int)FontVariant::OldstyleNums) != 0));
    OH_Drawing_TextStyleAddFontFeature(
        textStyle.get(),
        "lnum",
        static_cast<int>((fontVariant & (int)FontVariant::LiningNums) != 0));
    OH_Drawing_TextStyleAddFontFeature(
        textStyle.get(),
        "tnum",
        static_cast<int>((fontVariant & (int)FontVariant::TabularNums) != 0));
    OH_Drawing_TextStyleAddFontFeature(
        textStyle.get(),
        "pnum",
        static_cast<int>(
            (fontVariant & (int)FontVariant::ProportionalNums) != 0));
  }

  auto fragmentContent = fragment.string;
  if (fragment.textAttributes.textTransform.has_value()) {
    textCaseTransform(
        fragmentContent, fragment.textAttributes.textTransform.value());
  }

  // push text and corresponding textStyle to handler
  OH_ArkUI_StyledString_PushTextStyle(m_styledString.get(), textStyle.get());
  OH_ArkUI_StyledString_AddText(m_styledString.get(), fragmentContent.c_str());
  m_fragmentLengths.emplace_back(utf8Length(fragment.string));
}
void StyledStringWrapper::addAttachment(
    const facebook::react::AttributedString::Fragment& fragment) {
  // using placeholder span for inline views
  OH_Drawing_PlaceholderSpan inlineView = {
      fragment.parentShadowView.layoutMetrics.frame.size.width * m_scale,
      fragment.parentShadowView.layoutMetrics.frame.size.height * m_scale,
      // align to the line's baseline
      ALIGNMENT_ABOVE_BASELINE,
      TEXT_BASELINE_ALPHABETIC,
      0,
  };
  // push placeholder to handler
  OH_ArkUI_StyledString_AddPlaceholder(m_styledString.get(), &inlineView);
  m_attachmentCount++;
}
}; // namespace rnoh
