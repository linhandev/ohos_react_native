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
#include "FontRegistry.h"
#include "react/renderer/attributedstring/primitives.h"
namespace rnoh {

using SharedStyledString = std::shared_ptr<ArkUI_StyledString>;

using UniqueTextStyle = std::
    unique_ptr<OH_Drawing_TextStyle, decltype(&OH_Drawing_DestroyTextStyle)>;

/**
 * @internal
 */
class StyledStringWrapper final {
 public:
  StyledStringWrapper(
      OH_Drawing_TypographyStyle* typographyStyle,
      SharedFontCollection fontCollection,
      float scale,
      float fontMultiplier)
      : m_styledString(
            OH_ArkUI_StyledString_Create(typographyStyle, fontCollection.get()),
            OH_ArkUI_StyledString_Destroy),
        m_scale(scale),
        m_fontMultiplier(fontMultiplier),
        m_fontCollection(std::move(fontCollection)) {}

  ArkUI_StyledString* get() const {
    return m_styledString.get();
  }

  void addFragment(
      const facebook::react::AttributedString::Fragment& fragment) {
    if (!fragment.isAttachment()) {
      addTextFragment(fragment);
    } else {
      addAttachment(fragment);
    }
  }

 private:
  using FontVariant = facebook::react::FontVariant;

  void addTextFragment(
      const facebook::react::AttributedString::Fragment& fragment);

  void addAttachment(
      const facebook::react::AttributedString::Fragment& fragment);

  SharedStyledString m_styledString;
  size_t m_attachmentCount = 0;
  std::vector<size_t> m_fragmentLengths{};
  SharedFontCollection m_fontCollection;
  float m_scale;
  float m_fontMultiplier;

  friend class TextMeasurer;
};
} // namespace rnoh
