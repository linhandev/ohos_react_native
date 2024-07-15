#pragma once
#include <react/renderer/graphics/Size.h>
#include <react/renderer/textlayoutmanager/TextLayoutManager.h>
#include <string>
#include "ArkUITypography.h"
#include "FontRegistry.h"
#include "RNOH/FeatureFlagRegistry.h"
#include "RNOH/TaskExecutor/TaskExecutor.h"
#include "napi/native_api.h"

namespace rnoh {
class TextMeasurer : public facebook::react::TextLayoutManagerDelegate {
 public:
  TextMeasurer(
      napi_env env,
      napi_ref measureTextFnRef,
      TaskExecutor::Shared taskExecutor,
      FeatureFlagRegistry::Shared featureFlagManager,
      FontRegistry::Shared fontRegistry)
      : m_env(env),
        m_measureTextFnRef(measureTextFnRef),
        m_taskExecutor(taskExecutor),
        m_featureFlagRegistry(featureFlagManager),
        m_fontRegistry(std::move(fontRegistry)) {}

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

 private:
  napi_env m_env;
  napi_ref m_measureTextFnRef;
  TaskExecutor::Shared m_taskExecutor;
  FeatureFlagRegistry::Shared m_featureFlagRegistry;
  FontRegistry::Shared m_fontRegistry;
  int32_t getOHDrawingTextAlign(
      const facebook::react::TextAlignment& textAlign);
};
} // namespace rnoh
