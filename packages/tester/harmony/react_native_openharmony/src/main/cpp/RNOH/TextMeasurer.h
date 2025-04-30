/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once
#include <react/renderer/graphics/Size.h>
#include <react/renderer/textlayoutmanager/TextLayoutManager.h>
#include <codecvt>
#include <string>
#include "ArkUITypography.h"
#include "FontRegistry.h"
#include "RNOH/FeatureFlagRegistry.h"

namespace rnoh {
class TextMeasurer final : public facebook::react::TextLayoutManagerDelegate {
 public:
  struct U16TextContent {
    std::u16string text;
    bool hasAttachmentCharacter;
  };

  class TextStorage {
    using AttributedString = facebook::react::AttributedString;
    using ParagraphAttributes = facebook::react::ParagraphAttributes;
    using LayoutConstraints = facebook::react::LayoutConstraints;
    using LinesMeasurements = facebook::react::LinesMeasurements;

   public:
    StyledStringWrapper styledString;
    ArkUITypography arkUITypography;
    AttributedString attributedString;
    ParagraphAttributes paragraphAttributes;
    LayoutConstraints layoutConstraints;
    LinesMeasurements linesMeasurements;
  };

  TextMeasurer(
      FeatureFlagRegistry::Shared featureFlagManager,
      FontRegistry::Shared fontRegistry,
      int id)
      : m_featureFlagRegistry(featureFlagManager),
        m_fontRegistry(std::move(fontRegistry)),
        m_rnInstanceId(id) {}

  ~TextMeasurer() {
    DLOG(INFO) << "~TextMeasurer";
  };

  facebook::react::TextMeasurement measure(
      const facebook::react::AttributedStringBox& attributedStringBox,
      const facebook::react::ParagraphAttributes& paragraphAttributes,
      const facebook::react::TextLayoutContext& layoutContext,
      facebook::react::LayoutConstraints layoutConstraints) override;

  TextStorage createTextStorage(
      facebook::react::AttributedString attributedString,
      facebook::react::ParagraphAttributes paragraphAttributes,
      facebook::react::LayoutConstraints layoutConstraints) const;

  void setTextMeasureParams(float m_fontScale, float m_scale);

 private:
  TextStorage findFitFontSize(
      int maxFontSize,
      facebook::react::AttributedString const& attributedString,
      facebook::react::ParagraphAttributes const& paragraphAttributes,
      facebook::react::LayoutConstraints const& layoutConstraints) const;

  StyledStringWrapper createStyledString(
      facebook::react::AttributedString const& attributedString,
      facebook::react::ParagraphAttributes const& paragraphAttributes) const;

  facebook::react::LinesMeasurements getLinesMeasurements(
      ArkUITypography const& arkUITypography,
      U16TextContent const& textContent) const;

  U16TextContent getTextContent(
      facebook::react::AttributedString const& attributedString) const;

  FeatureFlagRegistry::Shared m_featureFlagRegistry;
  FontRegistry::Shared m_fontRegistry;

  float m_fontScale = 1.0f;
  float m_scale = 1.0f;
  int m_rnInstanceId = 0;
};
} // namespace rnoh
