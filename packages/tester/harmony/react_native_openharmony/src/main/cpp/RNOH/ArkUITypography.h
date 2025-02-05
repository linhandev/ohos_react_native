/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once
#include <arkui/native_type.h>
#include <arkui/styled_string.h>
#include <native_drawing/drawing_brush.h>
#include <native_drawing/drawing_font_collection.h>
#include <native_drawing/drawing_text_typography.h>
#include <react/renderer/graphics/Size.h>
#include <react/renderer/textlayoutmanager/TextLayoutManager.h>
#include <memory>
#include "RNOH/StyledStringWrapper.h"

namespace rnoh {

/**
 * @internal
 */
using UniqueTypographyStyle = std::unique_ptr<
    OH_Drawing_TypographyStyle,
    decltype(&OH_Drawing_DestroyTypographyStyle)>;

/**
 * @internal
 */
class ArkUITypography final {
 public:
  facebook::react::TextMeasurement::Attachments getAttachments() const {
    facebook::react::TextMeasurement::Attachments result;
    result.reserve(m_attachmentCount);
    auto placeholderRects =
        OH_Drawing_TypographyGetRectsForPlaceholders(m_typography.get());

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
    return OH_Drawing_TypographyGetHeight(m_typography.get()) / m_scale;
  }

  facebook::react::Float getLongestLineWidth() const {
    return OH_Drawing_TypographyGetLongestLine(m_typography.get()) / m_scale;
  }

  bool didExceedMaxLines() const {
    return OH_Drawing_TypographyDidExceedMaxLines(m_typography.get());
  }

  using Rects = std::vector<facebook::react::Rect>;

  std::vector<Rects> getRectsForFragments() const {
    std::vector<Rects> result;
    result.reserve(m_fragmentLengths.size());
    size_t fragmentBegin = 0;
    for (size_t i = 0; i < m_fragmentLengths.size(); i++) {
      auto fragmentEnd = fragmentBegin + m_fragmentLengths[i];
      auto textBoxes = OH_Drawing_TypographyGetRectsForRange(
          m_typography.get(),
          fragmentBegin,
          fragmentEnd,
          RECT_HEIGHT_STYLE_MAX,
          RECT_WIDTH_STYLE_MAX);
      auto textBoxCount = OH_Drawing_GetSizeOfTextBox(textBoxes);
      Rects rects;
      rects.reserve(textBoxCount);
      for (size_t j = 0; j < textBoxCount; j++) {
        facebook::react::Rect rect;
        rect.origin.x = OH_Drawing_GetLeftFromTextBox(textBoxes, j) / m_scale;
        rect.origin.y = OH_Drawing_GetTopFromTextBox(textBoxes, j) / m_scale;
        rect.size.width = (OH_Drawing_GetRightFromTextBox(textBoxes, j) -
                           OH_Drawing_GetLeftFromTextBox(textBoxes, j)) /
            m_scale;
        rect.size.height = (OH_Drawing_GetBottomFromTextBox(textBoxes, j) -
                            OH_Drawing_GetTopFromTextBox(textBoxes, j)) /
            m_scale;
        rects.emplace_back(std::move(rect));
      }
      result.emplace_back(std::move(rects));
      fragmentBegin = fragmentEnd;
    }
    return result;
  }

  facebook::react::TextMeasurement getMeasurement() const {
    facebook::react::Size clampedSize = m_layoutConstraints.clamp({
        .width = getLongestLineWidth(),
        .height = getHeight(),
    });
    return {clampedSize, getAttachments()};
  }

 private:
  ArkUITypography(
      ArkUI_StyledString* styledString,
      size_t attachmentCount,
      std::vector<size_t> fragmentLengths,
      facebook::react::LayoutConstraints layoutConstraints,
      float scale)
      : m_typography(
            OH_ArkUI_StyledString_CreateTypography(styledString),
            OH_Drawing_DestroyTypography),
        m_attachmentCount(attachmentCount),
        m_fragmentLengths(std::move(fragmentLengths)),
        m_layoutConstraints(std::move(layoutConstraints)),
        m_scale(scale) {
    facebook::react::Float scaledWidth =
        m_layoutConstraints.maximumSize.width * m_scale;
    if (isnan(scaledWidth) || scaledWidth <= 0) {
      scaledWidth = std::numeric_limits<decltype(scaledWidth)>::max();
    }
    OH_Drawing_TypographyLayout(m_typography.get(), scaledWidth);
  }

  std::shared_ptr<OH_Drawing_Typography> m_typography;
  size_t m_attachmentCount;
  std::vector<size_t> m_fragmentLengths;
  facebook::react::LayoutConstraints m_layoutConstraints;

  float m_scale = 1.0;

  friend class TextMeasurer;
};

} // namespace rnoh
