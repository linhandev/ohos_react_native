#pragma once
#include <arkui/native_type.h>
#include <arkui/styled_string.h>
#include <native_drawing/drawing_brush.h>
#include <native_drawing/drawing_font_collection.h>
#include <native_drawing/drawing_text_typography.h>
#include <react/renderer/graphics/Size.h>
#include <react/renderer/textlayoutmanager/TextLayoutManager.h>
#include <memory>
#include "react/renderer/attributedstring/primitives.h"

namespace rnoh {

using UniqueTypographyStyle = std::unique_ptr<
    OH_Drawing_TypographyStyle,
    decltype(&OH_Drawing_DestroyTypographyStyle)>;
using UniqueFontCollection = std::unique_ptr<
    OH_Drawing_FontCollection,
    decltype(&OH_Drawing_DestroyFontCollection)>;

class ArkUITypography final {
 public:
  facebook::react::TextMeasurement::Attachments getAttachments() const {
    facebook::react::TextMeasurement::Attachments result;
    result.reserve(m_attachmentCount);
    auto placeholderRects =
        OH_Drawing_TypographyGetRectsForPlaceholders(m_typography);
    // calculate attachment sizes and positions
    for (auto i = 0; i < m_attachmentCount; i++) {
      facebook::react::TextMeasurement::Attachment attachment;
      attachment.frame.origin.x =
          OH_Drawing_GetLeftFromTextBox(placeholderRects, i);
      attachment.frame.origin.y =
          OH_Drawing_GetTopFromTextBox(placeholderRects, i);
      attachment.frame.size.width =
          OH_Drawing_GetRightFromTextBox(placeholderRects, i) -
          OH_Drawing_GetLeftFromTextBox(placeholderRects, i);
      attachment.frame.size.height =
          OH_Drawing_GetBottomFromTextBox(placeholderRects, i) -
          OH_Drawing_GetTopFromTextBox(placeholderRects, i);
      attachment.frame.size.height /= m_scale;
      attachment.frame.size.width /= m_scale;
      attachment.frame.origin.x /= m_scale;
      attachment.frame.origin.y /= m_scale;
      result.push_back(std::move(attachment));
    }
    return result;
  }

  facebook::react::Float getHeight() const {
    return OH_Drawing_TypographyGetHeight(m_typography) / m_scale;
  }

  facebook::react::Float getLongestLineWidth() const {
    return OH_Drawing_TypographyGetLongestLine(m_typography) / m_scale;
  }

  bool getExceedMaxLines() const {
    return OH_Drawing_TypographyDidExceedMaxLines(m_typography);
  }

  using Rects = std::vector<facebook::react::Rect>;

  std::vector<Rects> getRectsForFragments() const {
    std::vector<Rects> result;
    result.reserve(m_fragmentLengths.size());
    size_t fragmentBegin = 0;
    for (size_t i = 0; i < m_fragmentLengths.size(); i++) {
      auto fragmentEnd = fragmentBegin + m_fragmentLengths[i];
      auto textBoxes = OH_Drawing_TypographyGetRectsForRange(
          m_typography,
          fragmentBegin,
          fragmentEnd,
          RECT_HEIGHT_STYLE_MAX,
          RECT_WIDTH_STYLE_MAX);
      auto textBoxCount = OH_Drawing_GetSizeOfTextBox(textBoxes);
      Rects rects;
      rects.reserve(textBoxCount);
      for (size_t j = 0; j < textBoxCount; j++) {
        facebook::react::Rect rect;
        rect.origin.x = (OH_Drawing_GetLeftFromTextBox(textBoxes, j)) / m_scale;
        rect.origin.y = (OH_Drawing_GetTopFromTextBox(textBoxes, j)) / m_scale;
        rect.size.width = (OH_Drawing_GetRightFromTextBox(textBoxes, j) -
            OH_Drawing_GetLeftFromTextBox(textBoxes, j)) / m_scale;
        rect.size.height = (OH_Drawing_GetBottomFromTextBox(textBoxes, j) -
            OH_Drawing_GetTopFromTextBox(textBoxes, j)) / m_scale;
        rects.emplace_back(std::move(rect));
      }
      result.emplace_back(std::move(rects));
      fragmentBegin = fragmentEnd;
    }
    return result;
  }
  
  void getLineMetrics(std::vector<OH_Drawing_LineMetrics>& data) const {
    auto count = OH_Drawing_TypographyGetLineCount(m_typography);
    for (int i = 0; i < count; i++) {
      OH_Drawing_LineMetrics metrics;
      OH_Drawing_TypographyGetLineMetricsAt(m_typography, i, &metrics);
      data.push_back(metrics);
    }
  }
  
  OH_Drawing_Typography* getTypography() {
    return m_typography;
  }

 private:
  ArkUITypography(
      ArkUI_StyledString* typographyHandler,
      size_t attachmentCount,
      std::vector<size_t> fragmentLengths,
      facebook::react::Float maxWidth,
      float scale)
      : m_typography(
            OH_ArkUI_StyledString_CreateTypography(typographyHandler)),
        m_attachmentCount(attachmentCount),
        m_fragmentLengths(std::move(fragmentLengths)),
        m_scale(scale) {
    OH_Drawing_TypographyLayout(m_typography, maxWidth);
  }
  
  OH_Drawing_Typography* m_typography = nullptr;
  size_t m_attachmentCount;
  std::vector<size_t> m_fragmentLengths;

  float m_scale = 1.0;
  friend class ArkUITypographyBuilder;
};

class ArkUITypographyBuilder final {
 public:
  ArkUITypographyBuilder(
      OH_Drawing_TypographyStyle* typographyStyle,
      OH_Drawing_FontCollection* fontCollection,
      float scale,
      bool halfleading)
      : m_typographyHandler(OH_ArkUI_StyledString_Create(typographyStyle,fontCollection)),
        m_scale(scale),
        m_halfleading(halfleading),
        m_typographyStyle(typographyStyle) {}

  void setMaximumWidth(facebook::react::Float maximumWidth) {
    if (!isnan(maximumWidth) && maximumWidth > 0) {
      m_maximumWidth = maximumWidth;
    } else {
      m_maximumWidth = std::numeric_limits<facebook::react::Float>::max();
    }
  }

  void addFragment(
      const facebook::react::AttributedString::Fragment& fragment) {
    if (!fragment.isAttachment()) {
      addTextFragment(fragment);
    } else {
      addAttachment(fragment);
    }
  }

  ArkUITypography build() const {
    return ArkUITypography(
        m_typographyHandler,
        m_attachmentCount,
        m_fragmentLengths,
        m_maximumWidth,
        m_scale);
  }

  ArkUI_StyledString* getTextStyleString() {
    return m_typographyHandler;
  }
  
  OH_Drawing_TypographyStyle* getTextTypographyStyle() {
    return m_typographyStyle;
  }

  std::vector<OH_Drawing_TextStyle*> getTextStyles() {
    return std::move(m_textStyles);
  }

 private:
  float m_scale = 1.0;
  bool m_halfleading = false;
  std::vector<OH_Drawing_TextStyle*> m_textStyles;
  std::vector<OH_Drawing_PlaceholderSpan> m_placeholderSpan;
  OH_Drawing_TypographyStyle* m_typographyStyle = nullptr;
  
  size_t utf8Length(const std::string& str) {
    size_t length = 0;
    for (auto c : str) {
      if ((c & 0x80) == 0 || (c & 0xc0) == 0xc0) {
        length++;
      }
    }
    return length;
  }
  
  void addTextFragment(
      const facebook::react::AttributedString::Fragment& fragment) {
    auto textStyle = OH_Drawing_CreateTextStyle();
    OH_Drawing_SetTextStyleHalfLeading(textStyle, m_halfleading);
    // fontSize
    auto fontSize = fragment.textAttributes.fontSize;
    if (fontSize <= 0) {
      // set fontSize to default for negative values(same as iOS)
      fontSize = 14;
    }
    OH_Drawing_SetTextStyleFontSize(textStyle, fontSize * m_scale);
    
    // fontStyle
    if (fragment.textAttributes.fontStyle.has_value()) {
      OH_Drawing_SetTextStyleFontStyle(textStyle, (int)fragment.textAttributes.fontStyle.value());
    }
    
    // fontColor
    if (fragment.textAttributes.foregroundColor) {
      OH_Drawing_SetTextStyleColor(textStyle, (uint32_t)(*fragment.textAttributes.foregroundColor));
    }
    
    // textDecoration
    int32_t textDecorationType = TEXT_DECORATION_NONE;
    uint32_t textDecorationColor = 0xFF000000;
    int32_t textDecorationStyle = TEXT_DECORATION_STYLE_SOLID;
    if (fragment.textAttributes.textDecorationLineType.has_value()) {
      textDecorationType = (int32_t)fragment.textAttributes.textDecorationLineType.value();
      if (fragment.textAttributes.textDecorationColor) {
        textDecorationColor = (uint32_t)(*fragment.textAttributes.textDecorationColor);
      } else if (fragment.textAttributes.foregroundColor) {
        textDecorationColor = (uint32_t)(*fragment.textAttributes.foregroundColor);
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
      textDecorationStyle = (int32_t)fragment.textAttributes.textDecorationStyle.value();
    }
    OH_Drawing_SetTextStyleDecoration(textStyle, textDecorationType);
    OH_Drawing_SetTextStyleDecorationColor(textStyle, textDecorationColor);
    OH_Drawing_SetTextStyleDecorationStyle(textStyle, textDecorationStyle);
    
    // backgroundColor
    OH_Drawing_Brush* brush = OH_Drawing_BrushCreate();
    if (fragment.textAttributes.isHighlighted.has_value() && fragment.textAttributes.isHighlighted.value()) {
      OH_Drawing_BrushSetColor(brush, (uint32_t)0xFF80808080);
      OH_Drawing_SetTextStyleBackgroundBrush(textStyle, brush);
    } else if (fragment.textAttributes.backgroundColor) {
      OH_Drawing_BrushSetColor(brush, (uint32_t)(*fragment.textAttributes.backgroundColor));
      OH_Drawing_SetTextStyleBackgroundBrush(textStyle, brush);
    }
    
    // shadow
    OH_Drawing_TextShadow* shadow = OH_Drawing_CreateTextShadow();
    
    // new NDK for setting letterSpacing
    if (!isnan(fragment.textAttributes.letterSpacing)) {
      OH_Drawing_SetTextStyleLetterSpacing(textStyle, fragment.textAttributes.letterSpacing);
    }
    if (!isnan(fragment.textAttributes.lineHeight) &&
        fragment.textAttributes.lineHeight > 0) {
      // fontSize * fontHeight = lineHeight, no direct ndk for setting
      // lineHeight so do it in this weird way
      double fontHeight = fragment.textAttributes.lineHeight / fontSize;
      OH_Drawing_SetTextStyleFontHeight(textStyle, fontHeight);
    }
    if (fragment.textAttributes.fontWeight.has_value()) {
      OH_Drawing_SetTextStyleFontWeight(
          textStyle,
          mapValueToFontWeight(
              int(fragment.textAttributes.fontWeight.value())));
    }
    if (!fragment.textAttributes.fontFamily.empty()) {
      const char* fontFamilies[] = {fragment.textAttributes.fontFamily.c_str()};
      OH_Drawing_SetTextStyleFontFamilies(textStyle, 1, fontFamilies);
    }
    // push text and corresponding textStyle to handler
    OH_ArkUI_StyledString_PushTextStyle(
        m_typographyHandler, textStyle);
    OH_ArkUI_StyledString_AddText(
        m_typographyHandler, fragment.string.c_str());
    m_textStyles.emplace_back(textStyle);
    OH_Drawing_DestroyTextShadow(shadow);
    OH_Drawing_BrushDestroy(brush);
    m_fragmentLengths.emplace_back(utf8Length(fragment.string));
  }

  void addAttachment(
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
    OH_ArkUI_StyledString_AddPlaceholder(
        m_typographyHandler, &inlineView);
    m_placeholderSpan.emplace_back(inlineView);
    m_attachmentCount++;
  }

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

  ArkUI_StyledString* m_typographyHandler = nullptr;
  size_t m_attachmentCount = 0;
  std::vector<size_t> m_fragmentLengths{};
  facebook::react::Float m_maximumWidth =
      std::numeric_limits<facebook::react::Float>::max();
};

} // namespace rnoh