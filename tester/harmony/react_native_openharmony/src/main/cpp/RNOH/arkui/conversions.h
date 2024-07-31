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
} // namespace rnoh
