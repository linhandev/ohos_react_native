#pragma once
#include <react/renderer/graphics/Size.h>
#include <react/renderer/textlayoutmanager/TextLayoutManager.h>
#include <string>
#include "ArkUITypography.h"
#include "FontRegistry.h"
#include "RNOH/FeatureFlagRegistry.h"
#include "RNOH/TaskExecutor/TaskExecutor.h"
#include "TextMeasureRegistry.h"
#include "napi/native_api.h"

namespace rnoh {
class TextMeasurer : public facebook::react::TextLayoutManagerDelegate {
 public:
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
      facebook::react::AttributedString attributedString,
      facebook::react::ParagraphAttributes paragraphAttributes,
      facebook::react::LayoutConstraints layoutConstraints) override;

  ArkUITypography measureTypography(
      facebook::react::AttributedString const& attributedString,
      facebook::react::ParagraphAttributes const& paragraphAttributes,
      facebook::react::LayoutConstraints const& layoutConstraints);

  void
  setTextMeasureParams(float m_fontScale, float m_scale, bool m_halfLeading);

 private:
  ArkUITypography findFitFontSize(
      int maxFontSize,
      facebook::react::AttributedString const& attributedStringRef,
      facebook::react::ParagraphAttributes const& paragraphAttributes,
      facebook::react::LayoutConstraints const& layoutConstraints);

  std::string stringCapitalize(const std::string& strInput);
  void textCaseTransform(
      std::string& textContent,
      facebook::react::TextTransform type);

  FeatureFlagRegistry::Shared m_featureFlagRegistry;
  FontRegistry::Shared m_fontRegistry;
  int32_t getOHDrawingTextAlign(
      const facebook::react::TextAlignment& textAlign);
  int32_t getOHDrawingTextDirection(
      const facebook::react::WritingDirection& writingDirection);

  std::string keyForAttributedString(
      facebook::react::AttributedString const& attributedString);

  OH_Drawing_EllipsisModal mapEllipsizeMode(
      facebook::react::EllipsizeMode ellipsizeMode);

  float m_fontScale = 1.0f;
  float m_scale = 1.0f;
  int m_rnInstanceId = 0;
  bool m_halfLeading = false;
};
} // namespace rnoh
