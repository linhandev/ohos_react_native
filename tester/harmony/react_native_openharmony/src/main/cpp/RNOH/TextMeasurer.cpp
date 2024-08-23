#include "TextMeasurer.h"
#include <native_drawing/drawing_register_font.h>
#include "RNInstance.h"
#include "RNInstanceCAPI.h"
#include "RNOH/ArkJS.h"
#include "RNOH/ArkTSBridge.h"
#include "RNOH/ArkUITypography.h"
#include "RNOHCorePackage/ComponentInstances/TextConversions.h"
#include "RNOHCorePackage/TurboModules/DeviceInfoTurboModule.h"

namespace rnoh {

using TextMeasurement = facebook::react::TextMeasurement;
using AttributedString = facebook::react::AttributedString;
using ParagraphAttributes = facebook::react::ParagraphAttributes;
using LayoutConstraints = facebook::react::LayoutConstraints;

std::string TextMeasurer::keyForAttributedString(
    facebook::react::AttributedString const& attributedString) {
  std::stringstream ss;
  ss << m_rnInstanceId << "_"
     << attributedString.getFragments()[0].parentShadowView.tag << "_"
     << attributedString.getFragments()[0].parentShadowView.surfaceId;
  return ss.str();
}

TextMeasurement TextMeasurer::measure(
    AttributedString attributedString,
    ParagraphAttributes paragraphAttributes,
    LayoutConstraints layoutConstraints) {
  facebook::react::SystraceSection s("#RNOH::TextMeasurer::measure");

  float fontMultiplier = 1.0;
  if (paragraphAttributes.allowFontScaling) {
    fontMultiplier = m_fontScale;
    if (!isnan(paragraphAttributes.maxFontSizeMultiplier)) {
      fontMultiplier = std::min(
          m_fontScale, (float)paragraphAttributes.maxFontSizeMultiplier);
    }
  }
  for (auto& fragment : attributedString.getFragments()) {
    if (fragment.textAttributes.textTransform.has_value()) {
      textCaseTransform(
          fragment.string, fragment.textAttributes.textTransform.value());
    }
    fragment.textAttributes.fontSize *= fontMultiplier;
  }

  facebook::react::TextMeasureCacheKey cacheKey{
      attributedString, paragraphAttributes, layoutConstraints};
  auto measureInfo =
      TextMeasureRegistry::getTextMeasureRegistry().getTextMeasureInfo(
          cacheKey);

  if (measureInfo != nullptr) {
    if (!attributedString.getFragments().empty()) {
      auto key = keyForAttributedString(attributedString);
      TextMeasureRegistry::getTextMeasureRegistry().setTextMeasureInfo(
          key, measureInfo, cacheKey);
    }
    const auto& typography = measureInfo->typography;

    auto height = typography.getHeight();
    auto longestLineWidth = typography.getLongestLineWidth();

    auto attachments = typography.getAttachments();
    return {{.width = longestLineWidth + 0.5, .height = height}, attachments};
  }

  if (paragraphAttributes.adjustsFontSizeToFit) {
    int maxFontSize = 0;
    for (const auto& fragment : attributedString.getFragments()) {
      maxFontSize =
          std::max(maxFontSize, (int)fragment.textAttributes.fontSize);
    }
    auto typography = findFitFontSize(
        maxFontSize, attributedString, paragraphAttributes, layoutConstraints);
    auto height = typography.getHeight();
    auto longestLineWidth = typography.getLongestLineWidth();
    auto attachments = typography.getAttachments();
    if (!attributedString.getFragments().empty()) {
      auto key = keyForAttributedString(attributedString);
      std::shared_ptr<TextMeasureInfo> textMeasureInfo =
          std::make_shared<TextMeasureInfo>(std::move(typography));
      TextMeasureRegistry::getTextMeasureRegistry().setTextMeasureInfo(
          key, textMeasureInfo, cacheKey);
    }
    return {{.width = longestLineWidth + 0.5, .height = height}, attachments};
  } else {
    auto typography = measureTypography(
        attributedString, paragraphAttributes, layoutConstraints);

    auto height = typography.getHeight();
    auto longestLineWidth = typography.getLongestLineWidth();
    if (longestLineWidth < layoutConstraints.maximumSize.width) {
      layoutConstraints.maximumSize.width = longestLineWidth;

      typography = measureTypography(
          attributedString, paragraphAttributes, layoutConstraints);
      height = typography.getHeight();
      longestLineWidth = typography.getLongestLineWidth();
    }
    auto attachments = typography.getAttachments();
    if (!attributedString.getFragments().empty()) {
      auto key = keyForAttributedString(attributedString);
      std::shared_ptr<TextMeasureInfo> textMeasureInfo =
          std::make_shared<TextMeasureInfo>(std::move(typography));
      TextMeasureRegistry::getTextMeasureRegistry().setTextMeasureInfo(
          key, textMeasureInfo, cacheKey);
    }
    return {{.width = longestLineWidth + 0.5, .height = height}, attachments};
  }
}

OH_Drawing_EllipsisModal TextMeasurer::mapEllipsizeMode(
    facebook::react::EllipsizeMode ellipsizeMode) {
  switch (ellipsizeMode) {
    case facebook::react::EllipsizeMode::Head:
      return ELLIPSIS_MODAL_HEAD;
    case facebook::react::EllipsizeMode::Middle:
      return ELLIPSIS_MODAL_MIDDLE;
    case facebook::react::EllipsizeMode::Tail:
      return ELLIPSIS_MODAL_TAIL;
  }
}

ArkUITypography TextMeasurer::measureTypography(
    AttributedString const& attributedString,
    ParagraphAttributes const& paragraphAttributes,
    LayoutConstraints const& layoutConstraints) {
  UniqueTypographyStyle typographyStyle(
      OH_Drawing_CreateTypographyStyle(), OH_Drawing_DestroyTypographyStyle);

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

  ArkUITypographyBuilder typographyBuilder(
      typographyStyle.get(),
      m_fontRegistry->getFontCollection(),
      m_scale,
      m_halfLeading);
  for (auto const& fragment : attributedString.getFragments()) {
    typographyBuilder.addFragment(fragment);
  }

  typographyBuilder.setMaximumWidth(
      layoutConstraints.maximumSize.width * m_scale);
  return typographyBuilder.build();
}

int32_t TextMeasurer::getOHDrawingTextAlign(
    const facebook::react::TextAlignment& textAlign) {
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

int32_t TextMeasurer::getOHDrawingTextDirection(
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

ArkUITypography TextMeasurer::findFitFontSize(
    int maxFontSize,
    facebook::react::AttributedString const& attributedStringRef,
    facebook::react::ParagraphAttributes const& paragraphAttributes,
    facebook::react::LayoutConstraints const& layoutConstraints) {
  auto attributedString = attributedStringRef;

  // init params
  int minFontSize = 1;
  if (!isnan(paragraphAttributes.minimumFontScale)) {
    minFontSize = ceil(paragraphAttributes.minimumFontScale * maxFontSize);
  }
  int finalFontSize = minFontSize;
  int initFontSize = maxFontSize;
  auto backupAttributedString = attributedString;
  // check if already fit
  auto finalTypography = measureTypography(
      attributedString, paragraphAttributes, layoutConstraints);
  if (finalTypography.getHeight() <= layoutConstraints.maximumSize.height &&
      (paragraphAttributes.maximumNumberOfLines == 0 ||
       !finalTypography.didExceedMaxLines())) {
    return std::move(finalTypography);
  }
  // find fit fontSize
  while (minFontSize <= maxFontSize) {
    int curFontSize = ceil((minFontSize + maxFontSize) * 1.0 / 2);
    float ratio = 1.0 * curFontSize / initFontSize;
    for (int i = 0; i < attributedString.getFragments().size(); ++i) {
      int newFontSize = ceil(
          backupAttributedString.getFragments()[i].textAttributes.fontSize *
          ratio);
      attributedString.getFragments()[i].textAttributes.fontSize = newFontSize;
    }
    auto typography = measureTypography(
        attributedString, paragraphAttributes, layoutConstraints);
    if (typography.getHeight() <= layoutConstraints.maximumSize.height &&
        (paragraphAttributes.maximumNumberOfLines == 0 ||
         !typography.didExceedMaxLines())) {
      finalFontSize = curFontSize;
      finalTypography = std::move(typography);
      minFontSize = curFontSize + 1;
    } else {
      maxFontSize = curFontSize - 1;
    }
  }
  float ratio = 1.0 * finalFontSize / initFontSize;
  for (int i = 0; i < attributedString.getFragments().size(); ++i) {
    int newFontSize = ceil(
        backupAttributedString.getFragments()[i].textAttributes.fontSize *
        ratio);
    attributedString.getFragments()[i].textAttributes.fontSize = newFontSize;
  }
  return std::move(finalTypography);
}

std::string TextMeasurer::stringCapitalize(const std::string& strInput) {
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

void TextMeasurer::textCaseTransform(
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

void TextMeasurer::setTextMeasureParams(
    float fontScale,
    float scale,
    bool halfLeading) {
  m_fontScale = fontScale;
  m_scale = scale;
  m_halfLeading = halfLeading;
}

} // namespace rnoh
