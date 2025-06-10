/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "TextMeasurer.h"
#include <cxxreact/SystraceSection.h>
#include <native_drawing/drawing_register_font.h>
#include <react/renderer/graphics/rounding.h>
#include <memory>
#include "RNOH/ArkUITypography.h"
#include "RNOH/StyledStringWrapper.h"
#include "RNOH/TextConversions.h"

namespace rnoh {

using TextMeasurement = facebook::react::TextMeasurement;
using AttributedString = facebook::react::AttributedString;
using ParagraphAttributes = facebook::react::ParagraphAttributes;
using LayoutConstraints = facebook::react::LayoutConstraints;

int32_t getOHDrawingTextAlign(const facebook::react::TextAlignment& textAlign) {
  int32_t align = OH_Drawing_TextAlign::TEXT_ALIGN_START;
  switch (textAlign) {
    case facebook::react::TextAlignment::Natural:
    case facebook::react::TextAlignment::Left:
      align = OH_Drawing_TextAlign::TEXT_ALIGN_START;
      break;
    case facebook::react::TextAlignment::Right:
      align = OH_Drawing_TextAlign::TEXT_ALIGN_END;
      break;
    case facebook::react::TextAlignment::Center:
      align = OH_Drawing_TextAlign::TEXT_ALIGN_CENTER;
      break;
    case facebook::react::TextAlignment::Justified:
      align = OH_Drawing_TextAlign::TEXT_ALIGN_JUSTIFY;
      break;
    default:
      break;
  }
  return align;
}

int32_t getOHDrawingTextDirection(
    const facebook::react::WritingDirection& writingDirection) {
  int32_t direction = OH_Drawing_TextDirection::TEXT_DIRECTION_LTR;
  switch (writingDirection) {
    case facebook::react::WritingDirection::Natural:
    case facebook::react::WritingDirection::LeftToRight:
      direction = OH_Drawing_TextDirection::TEXT_DIRECTION_LTR;
      break;
    case facebook::react::WritingDirection::RightToLeft:
      direction = OH_Drawing_TextDirection::TEXT_DIRECTION_RTL;
      break;
    default:
      break;
  }
  return direction;
}

OH_Drawing_EllipsisModal mapEllipsizeMode(
    facebook::react::EllipsizeMode ellipsizeMode) {
  switch (ellipsizeMode) {
    case facebook::react::EllipsizeMode::Head:
      return ELLIPSIS_MODAL_HEAD;
    case facebook::react::EllipsizeMode::Middle:
      return ELLIPSIS_MODAL_MIDDLE;
    case facebook::react::EllipsizeMode::Tail:
      return ELLIPSIS_MODAL_TAIL;
    default:
      return ELLIPSIS_MODAL_TAIL;
  }
}

facebook::react::TextMeasurement TextMeasurer::measure(
    const facebook::react::AttributedStringBox& attributedStringBox,
    const facebook::react::ParagraphAttributes& paragraphAttributes,
    const facebook::react::TextLayoutContext& layoutContext,
    facebook::react::LayoutConstraints layoutConstraints) {
  facebook::react::SystraceSection s("#RNOH::TextMeasurer::measure");
  auto textStorage = createTextStorage(
      std::move(attributedStringBox.getValue()),
      std::move(paragraphAttributes),
      std::move(layoutContext),
      std::move(layoutConstraints));
  setTextStorage(textStorage);
  return textStorage->arkUITypography.getMeasurement();
}
facebook::react::LinesMeasurements TextMeasurer::measureLines(
    const facebook::react::AttributedStringBox& attributedStringBox,
    const facebook::react::ParagraphAttributes& paragraphAttributes,
    const facebook::react::Size& size) {
  auto& attributedString = attributedStringBox.getValue();
  auto textStorage = getTextStorage(
      {attributedString,
       paragraphAttributes,
       {m_scale},
       static_cast<int>(ceil(size.width * m_scale))});
  if (!textStorage) {
    textStorage = createTextStorage(
        attributedString, paragraphAttributes, {m_scale}, {size, size});
  }
  auto& typography = textStorage->arkUITypography;
  std::stringstream ss;
  bool hasAttachmentCharacter = false;
  for (auto const& fragment : attributedString.getFragments()) {
    if (fragment.isAttachment()) {
      hasAttachmentCharacter = true;
    }
    ss << fragment.string;
  }
  std::u16string u16Text =
      std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t>{}
          .from_bytes(ss.str());
  return getLinesMeasurements(typography, u16Text, hasAttachmentCharacter);
};
facebook::react::LinesMeasurements TextMeasurer::getLinesMeasurements(
    ArkUITypography& typography,
    std::u16string& u16Text,
    bool hasAttachmentCharacter) {
  auto metrics =
      OH_Drawing_TypographyGetLineMetrics(typography.m_typography.get());
  auto metricsSize = OH_Drawing_LineMetricsGetSize(metrics);
  facebook::react::LinesMeasurements lineMetrics;
  lineMetrics.reserve(metricsSize);
  for (int i = 0; i < metricsSize; i++) {
    OH_Drawing_TypographyGetLineMetricsAt(
        typography.m_typography.get(), i, metrics);
    auto u16LineText = u16Text.substr(
        metrics->startIndex, metrics->endIndex - metrics->startIndex);
    if (hasAttachmentCharacter) {
      // NOTE: Use std::remove and erase to remove the placeholder character
      // `\uFFFC` in the UTF-16 string (corresponding to `0xFFFC` in UTF-16)
      u16LineText.erase(
          std::remove(u16LineText.begin(), u16LineText.end(), 0xFFFC),
          u16LineText.end());
    }
    std::string lineText =
        std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t>{}
            .to_bytes(u16LineText);
    facebook::react::LineMeasurement measurement(
        lineText,
        {{metrics->x / m_scale, metrics->y / m_scale},
         {metrics->width / m_scale, metrics->height / m_scale}},
        metrics->descender / m_scale,
        metrics->capHeight / m_scale,
        metrics->ascender / m_scale,
        metrics->xHeight / m_scale);
    lineMetrics.push_back(std::move(measurement));
  }
  OH_Drawing_DestroyLineMetrics(metrics);
  return lineMetrics;
}
TextMeasurer::TextStorage::Shared TextMeasurer::createTextStorage(
    facebook::react::AttributedString attributedString,
    facebook::react::ParagraphAttributes paragraphAttributes,
    facebook::react::TextLayoutContext layoutContext,
    facebook::react::LayoutConstraints layoutConstraints) const {
  if (paragraphAttributes.adjustsFontSizeToFit) {
    int maxFontSize = 0;
    for (const auto& fragment : attributedString.getFragments()) {
      maxFontSize =
          std::max(maxFontSize, (int)fragment.textAttributes.fontSize);
    }
    return findFitFontSize(
        maxFontSize,
        attributedString,
        paragraphAttributes,
        layoutContext,
        layoutConstraints);
  }

  auto styledString = createStyledString(attributedString, paragraphAttributes);
  auto typography = ArkUITypography(
      styledString.get(),
      styledString.m_attachmentCount,
      styledString.m_fragmentLengths,
      layoutConstraints,
      m_scale);
  return std::make_shared<TextStorage>(
      styledString,
      std::move(typography),
      attributedString,
      paragraphAttributes,
      layoutContext,
      layoutConstraints);
}

StyledStringWrapper TextMeasurer::createStyledString(
    AttributedString const& attributedString,
    ParagraphAttributes const& paragraphAttributes) const {
  UniqueTypographyStyle typographyStyle(
      OH_Drawing_CreateTypographyStyle(), OH_Drawing_DestroyTypographyStyle);
  float fontMultiplier = 1.0;
  if (paragraphAttributes.allowFontScaling) {
    fontMultiplier = m_fontScale;
    if (!isnan(paragraphAttributes.maxFontSizeMultiplier) &&
        paragraphAttributes.maxFontSizeMultiplier >= 1) {
      fontMultiplier = std::min(
          m_fontScale, (float)paragraphAttributes.maxFontSizeMultiplier);
    }
  }

  if (paragraphAttributes.ellipsizeMode !=
      facebook::react::EllipsizeMode::Clip) {
    OH_Drawing_SetTypographyTextEllipsis(typographyStyle.get(), "...");
    OH_Drawing_SetTypographyTextEllipsisModal(
        typographyStyle.get(),
        mapEllipsizeMode(paragraphAttributes.ellipsizeMode));
  }

  if (paragraphAttributes.maximumNumberOfLines > 0) {
    OH_Drawing_SetTypographyTextMaxLines(
        typographyStyle.get(), paragraphAttributes.maximumNumberOfLines);
  }

  OH_Drawing_SetTypographyTextWordBreakType(
      typographyStyle.get(),
      TextConversions::getArkUIWordBreakStrategy(
          paragraphAttributes.textBreakStrategy));

  if (paragraphAttributes.writingDirection ==
      facebook::react::WritingDirection::LeftToRight) {
    OH_Drawing_SetTypographyTextDirection(
        typographyStyle.get(), TEXT_DIRECTION_LTR);
  } else if (
      paragraphAttributes.writingDirection ==
      facebook::react::WritingDirection::RightToLeft) {
    OH_Drawing_SetTypographyTextDirection(
        typographyStyle.get(), TEXT_DIRECTION_RTL);
  }

  if (!attributedString.getFragments().empty()) {
    auto fragment = attributedString.getFragments()[0];
    auto textAlign = fragment.textAttributes.alignment;
    if (textAlign.has_value()) {
      OH_Drawing_SetTypographyTextAlign(
          typographyStyle.get(), getOHDrawingTextAlign(textAlign.value()));
    }
    auto textDirection = fragment.textAttributes.baseWritingDirection;
    if (textDirection.has_value()) {
      OH_Drawing_SetTypographyTextDirection(
          typographyStyle.get(),
          getOHDrawingTextDirection(textDirection.value()));
    }
  }

  StyledStringWrapper styledStringWrapper(
      typographyStyle.get(),
      m_fontRegistry->getFontCollection(),
      m_fontRegistry->getThemeFontFamily(),
      m_scale,
      fontMultiplier);
  for (auto const& fragment : attributedString.getFragments()) {
    styledStringWrapper.addFragment(fragment);
  }
  return styledStringWrapper;
}

auto TextMeasurer::findFitFontSize(
    int maxFontSize,
    facebook::react::AttributedString const& attributedString,
    facebook::react::ParagraphAttributes const& paragraphAttributes,
    facebook::react::TextLayoutContext const& layoutContext,
    facebook::react::LayoutConstraints const& layoutConstraints) const
    -> TextStorage::Shared {
  // check if already fit
  auto finalStyledString =
      createStyledString(attributedString, paragraphAttributes);
  auto finalTypography = ArkUITypography(
      finalStyledString.get(),
      finalStyledString.m_attachmentCount,
      finalStyledString.m_fragmentLengths,
      layoutConstraints,
      m_scale);

  if (finalTypography.getHeight() <= layoutConstraints.maximumSize.height &&
      (paragraphAttributes.maximumNumberOfLines == 0 ||
       !finalTypography.didExceedMaxLines())) {
    return std::make_shared<TextStorage>(
        finalStyledString,
        std::move(finalTypography),
        attributedString,
        paragraphAttributes,
        layoutContext,
        layoutConstraints);
  }

  auto fittedAttributedString = attributedString;

  // init params
  int minFontSize = 1;
  if (!isnan(paragraphAttributes.minimumFontScale)) {
    minFontSize = ceil(paragraphAttributes.minimumFontScale * maxFontSize);
  }
  int finalFontSize = minFontSize;
  int initFontSize = maxFontSize;
  // find fit fontSize
  while (minFontSize <= maxFontSize) {
    int curFontSize = ceil((minFontSize + maxFontSize) * 1.0 / 2);
    float ratio = 1.0 * curFontSize / initFontSize;
    for (int i = 0; i < fittedAttributedString.getFragments().size(); ++i) {
      int newFontSize = ceil(
          attributedString.getFragments()[i].textAttributes.fontSize * ratio);
      fittedAttributedString.getFragments()[i].textAttributes.fontSize =
          newFontSize;
    }

    auto styledString =
        createStyledString(fittedAttributedString, paragraphAttributes);
    auto typography = ArkUITypography(
        styledString.get(),
        styledString.m_attachmentCount,
        styledString.m_fragmentLengths,
        layoutConstraints,
        m_scale);
    if (typography.getHeight() <= layoutConstraints.maximumSize.height &&
        (paragraphAttributes.maximumNumberOfLines == 0 ||
         !typography.didExceedMaxLines())) {
      finalFontSize = curFontSize;
      finalTypography = std::move(typography);
      finalStyledString = std::move(styledString);
      minFontSize = curFontSize + 1;
    } else {
      maxFontSize = curFontSize - 1;
    }
  }
  return std::make_shared<TextStorage>(
      finalStyledString,
      std::move(finalTypography),
      attributedString,
      paragraphAttributes,
      layoutContext,
      layoutConstraints);
}

void TextMeasurer::setTextMeasureParams(float fontScale, float scale) {
  m_fontScale = fontScale;
  m_scale = scale;
  m_fontRegistry->updateThemeFont();
}

void TextMeasurer::setTextStorage(const TextStorage::Shared textStorage) {
  std::lock_guard<std::mutex> lock(m_mutex);
  m_textStorageCache.set(
      {textStorage->attributedString,
       textStorage->paragraphAttributes,
       textStorage->layoutContext,
       static_cast<int>(ceil(
           textStorage->arkUITypography.getMeasurement().size.width *
           textStorage->layoutContext.pointScaleFactor))},
      textStorage);
}

TextMeasurer::TextStorage::Shared TextMeasurer::getTextStorage(
    const CacheKey& key) {
  std::lock_guard<std::mutex> lock(m_mutex);
  // right/left may be ceil/floor to integer, make width = right - left have
  // error of 2 at most
  // errors ordered by frequency
  static constexpr std::array<px, 4> errors = {-1, 0, +1, -2};
  for (auto error : errors) {
    auto it = m_textStorageCache.find(
        {key.attributedString,
         key.paragraphAttributes,
         key.layoutContext,
         key.ceiledWidth + error});
    if (it != m_textStorageCache.end()) {
      return it->second;
    }
  }
  return nullptr;
}

} // namespace rnoh
