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
  UniqueFontCollection fontCollection(
      OH_Drawing_CreateFontCollection(), OH_Drawing_DestroyFontCollection);

  if (paragraphAttributes.maximumNumberOfLines > 0) {
    OH_Drawing_SetTypographyTextMaxLines(
        typographyStyle.get(), paragraphAttributes.maximumNumberOfLines);
  }

  OH_Drawing_SetTypographyTextWordBreakType(
      typographyStyle.get(),
      TextConversions::getArkUIWordBreakStrategy(
          paragraphAttributes.textBreakStrategy));

  if (!attributedString.getFragments().empty()) {
    auto textAlign =
        attributedString.getFragments()[0].textAttributes.alignment;
    if (textAlign.has_value()) {
      OH_Drawing_SetTypographyTextAlign(
          typographyStyle.get(), getOHDrawingTextAlign(textAlign.value()));
    }
  }

  ArkUITypographyBuilder typographyBuilder(
      typographyStyle.get(), m_fontRegistry->createFontCollection());
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

} // namespace rnoh
