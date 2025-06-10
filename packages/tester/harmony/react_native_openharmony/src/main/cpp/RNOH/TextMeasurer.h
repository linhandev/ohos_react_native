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
#include <mutex>
#include <string>
#include "ArkUITypography.h"
#include "FontRegistry.h"
#include "Graphics.h"
#include "RNOH/FeatureFlagRegistry.h"

namespace rnoh {

/*
 * Maximum size of the textStorageCache.
 */
constexpr auto textStorageThreadSafeCacheSizeCap = size_t{2048};

class TextMeasurer final : public facebook::react::TextLayoutManagerDelegate {
 public:
  class CacheKey final {
   public:
    facebook::react::AttributedString attributedString{};
    facebook::react::ParagraphAttributes paragraphAttributes{};
    facebook::react::TextLayoutContext layoutContext;
    px ceiledWidth;

    bool operator==(const CacheKey& other) const {
      auto& fragments = attributedString.getFragments();
      auto& otherFragments = other.attributedString.getFragments();

      if (fragments.size() != otherFragments.size()) {
        return false;
      }

      auto size = fragments.size();
      for (auto i = size_t{0}; i < size; i++) {
        auto& fragment = fragments.at(i);
        auto& otherFragment = otherFragments.at(i);
        if (!(fragment.string == otherFragment.string &&
              fragment.textAttributes == otherFragment.textAttributes &&
              // LayoutMetrics of an attachment fragment affects the size of a
              // measured attributed string.
              (!fragment.isAttachment() ||
               (fragment.parentShadowView.layoutMetrics ==
                otherFragment.parentShadowView.layoutMetrics)))) {
          return false;
        }
      }

      return paragraphAttributes == other.paragraphAttributes &&
          layoutContext.pointScaleFactor ==
          other.layoutContext.pointScaleFactor &&
          ceiledWidth == other.ceiledWidth;
    }
    struct Hasher {
      size_t operator()(const CacheKey& key) const {
        auto seed = size_t{0};

        for (const auto& fragment : key.attributedString.getFragments()) {
          facebook::react::hash_combine(
              seed, fragment.string, fragment.textAttributes);
        }

        facebook::react::hash_combine(
            seed,
            key.paragraphAttributes,
            key.layoutContext.pointScaleFactor,
            key.ceiledWidth);
        return seed;
      }
    };
  };
  /**
   * @threadSafe
   */
  class TextStorage {
    using AttributedString = facebook::react::AttributedString;
    using ParagraphAttributes = facebook::react::ParagraphAttributes;
    using LayoutConstraints = facebook::react::LayoutConstraints;
    using LayoutContext = facebook::react::TextLayoutContext;

   public:
    using Shared = std::shared_ptr<TextStorage>;

    StyledStringWrapper styledString;
    ArkUITypography arkUITypography;
    AttributedString attributedString;
    ParagraphAttributes paragraphAttributes;
    LayoutContext layoutContext;
    LayoutConstraints layoutConstraints;

    TextStorage(
        StyledStringWrapper& styledString,
        ArkUITypography arkUITypography,
        const AttributedString& attributedString,
        const ParagraphAttributes& paragraphAttributes,
        const LayoutContext& layoutContext,
        const LayoutConstraints& layoutConstraints)
        : styledString(styledString),
          arkUITypography(arkUITypography),
          attributedString(attributedString),
          paragraphAttributes(paragraphAttributes),
          layoutContext(layoutContext),
          layoutConstraints(layoutConstraints) {}
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

  facebook::react::LinesMeasurements measureLines(
      const facebook::react::AttributedStringBox& attributedStringBox,
      const facebook::react::ParagraphAttributes& paragraphAttributes,
      const facebook::react::Size& size) override;

  TextStorage::Shared createTextStorage(
      facebook::react::AttributedString attributedString,
      facebook::react::ParagraphAttributes paragraphAttributes,
      facebook::react::TextLayoutContext layoutContext,
      facebook::react::LayoutConstraints layoutConstraints) const;

  void setTextMeasureParams(float m_fontScale, float m_scale);

  /**
   * @threadSafe
   */
  TextStorage::Shared getTextStorage(const CacheKey& key);

 private:
  TextStorage::Shared findFitFontSize(
      int maxFontSize,
      facebook::react::AttributedString const& attributedString,
      facebook::react::ParagraphAttributes const& paragraphAttributes,
      facebook::react::TextLayoutContext const& layoutContext,
      facebook::react::LayoutConstraints const& layoutConstraints) const;

  StyledStringWrapper createStyledString(
      facebook::react::AttributedString const& attributedString,
      facebook::react::ParagraphAttributes const& paragraphAttributes) const;

  facebook::react::LinesMeasurements getLinesMeasurements(
      ArkUITypography& typography,
      std::u16string& u16Text,
      bool hasAttachmentCharacter);

  /**
   * @threadSafe
   */
  void setTextStorage(const TextStorage::Shared textStorage);

  FeatureFlagRegistry::Shared m_featureFlagRegistry;
  FontRegistry::Shared m_fontRegistry;
  mutable folly::
      EvictingCacheMap<CacheKey, TextStorage::Shared, CacheKey::Hasher>
          m_textStorageCache{rnoh::textStorageThreadSafeCacheSizeCap};
  std::mutex m_mutex;

  float m_fontScale = 1.0f;
  float m_scale = 1.0f;
  int m_rnInstanceId = 0;
};
} // namespace rnoh
