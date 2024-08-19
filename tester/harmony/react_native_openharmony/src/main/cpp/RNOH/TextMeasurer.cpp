#include "RNOH/TextMeasurer.h"
#include <native_drawing/drawing_font_collection.h>
#include <native_drawing/drawing_text_typography.h>
#include <react/renderer/debug/SystraceSection.h>
#include "RNOH/ArkJS.h"
#include "RNOH/ArkUITypography.h"
#include "RNOHCorePackage/ComponentInstances/TextConversions.h"

namespace rnoh {

using TextMeasurement = facebook::react::TextMeasurement;
using AttributedString = facebook::react::AttributedString;
using ParagraphAttributes = facebook::react::ParagraphAttributes;
using LayoutConstraints = facebook::react::LayoutConstraints;

TextMeasurement TextMeasurer::measure(
    AttributedString attributedString,
    ParagraphAttributes paragraphAttributes,
    LayoutConstraints layoutConstraints) {
  facebook::react::SystraceSection s("#RNOH::TextMeasurer::measure");
  auto typography = measureTypography(
      attributedString, paragraphAttributes, layoutConstraints);
  auto height = typography.getHeight();
  auto longestLineWidth = typography.getLongestLineWidth();
  return {
      {.width = longestLineWidth + 0.5, .height = height},
      typography.getAttachments()};
}

ArkUITypography TextMeasurer::measureTypography(
    AttributedString const& attributedString,
    ParagraphAttributes const& paragraphAttributes,
    LayoutConstraints const& layoutConstraints) {
  UniqueTypographyStyle typographyStyle(
      OH_Drawing_CreateTypographyStyle(), OH_Drawing_DestroyTypographyStyle);

  if (paragraphAttributes.maximumNumberOfLines > 0) {
    OH_Drawing_SetTypographyTextMaxLines(
        typographyStyle.get(), paragraphAttributes.maximumNumberOfLines);
  }

  OH_Drawing_SetTypographyTextWordBreakType(
      typographyStyle.get(),
      TextConversions::getArkUIWordBreakStrategy(
          paragraphAttributes.textBreakStrategy));

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
      typographyStyle.get(), m_fontRegistry->getFontCollection());
  for (auto const& fragment : attributedString.getFragments()) {
    typographyBuilder.addFragment(fragment);
  }
  typographyBuilder.setMaximumWidth(layoutConstraints.maximumSize.width);
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

} // namespace rnoh
