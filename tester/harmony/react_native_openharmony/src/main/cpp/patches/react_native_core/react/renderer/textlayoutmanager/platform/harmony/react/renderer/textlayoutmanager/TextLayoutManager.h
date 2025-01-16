/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <memory>

#include <react/renderer/attributedstring/AttributedString.h>
#include <react/renderer/attributedstring/AttributedStringBox.h>
#include <react/renderer/attributedstring/ParagraphAttributes.h>
#include <react/renderer/core/LayoutConstraints.h>
#include <react/renderer/textlayoutmanager/TextLayoutContext.h>
#include <react/renderer/textlayoutmanager/TextMeasureCache.h>
#include <react/utils/ContextContainer.h>

namespace facebook {
namespace react {

class TextLayoutManager;

using SharedTextLayoutManager = std::shared_ptr<const TextLayoutManager>;

class TextLayoutManagerDelegate {
 public:
  virtual TextMeasurement measure(
      AttributedString attributedString,
      ParagraphAttributes paragraphAttributes,
      LayoutConstraints layoutConstraints,
      std::shared_ptr<void> hostTextStorage) = 0;
  virtual std::shared_ptr<void> getHostTextStorage(
      AttributedString attributedString,
      ParagraphAttributes paragraphAttributes,
      LayoutConstraints layoutConstraints) const = 0;
};

/*
 * Cross platform facade for Android-specific TextLayoutManager.
 */
class TextLayoutManager {
 public:
  TextLayoutManager(const ContextContainer::Shared& contextContainer)
      : m_measureCache(kSimpleThreadSafeCacheSizeCap) {
    m_textLayoutManagerDelegate =
        contextContainer->at<std::shared_ptr<TextLayoutManagerDelegate>>(
            "textLayoutManagerDelegate");
  }

  /*
   * Measures `attributedStringBox` using native text rendering infrastructure.
   */
  virtual TextMeasurement measure(
      const AttributedStringBox& attributedStringBox,
      const ParagraphAttributes& paragraphAttributes,
      const TextLayoutContext& layoutContext,
      LayoutConstraints layoutConstraints) const;

  // RNOH patch
  TextMeasurement measure(
      const AttributedStringBox& attributedStringBox,
      const ParagraphAttributes& paragraphAttributes,
      LayoutConstraints layoutConstraints,
      std::shared_ptr<void> hostTextStorage) const;

  /**
   * Measures an AttributedString on the platform, as identified by some
   * opaque cache ID.
   */
  virtual TextMeasurement measureCachedSpannableById(
      int64_t cacheId,
      const ParagraphAttributes& paragraphAttributes,
      LayoutConstraints layoutConstraints) const;

  /*
   * Measures lines of `attributedString` using native text rendering
   * infrastructure.
   */
  virtual LinesMeasurements measureLines(
      const AttributedStringBox& attributedStringBox,
      const ParagraphAttributes& paragraphAttributes,
      const Size& size) const;

  /*
   * Returns an opaque pointer to platform-specific TextLayoutManager.
   * Is used on a native views layer to delegate text rendering to the manager.
   */
  void* getNativeTextLayoutManager() const;

  /*
   * Calculates baseline of `attributedString` using native text rendering
   * infrastructure.
   */
  virtual Float baseline(
      const AttributedStringBox& attributedStringBox,
      const ParagraphAttributes& paragraphAttributes,
      const Size& size) const;

  /**
   * RNOH patch
   * This method was preserved to make the RN update to RN@0.75.4 easier. The
   * method was available in RN@0.72.5, but that's no longer the case in
   * RN@0.75.4. RNOH should consider finding an alternative approach.
   */
  std::shared_ptr<void> getHostTextStorage(
      AttributedString attributedString,
      ParagraphAttributes paragraphAttributes,
      LayoutConstraints layoutConstraints) const;

 private:
  std::shared_ptr<TextLayoutManagerDelegate> m_textLayoutManagerDelegate;
  TextMeasureCache m_measureCache;
};

} // namespace react
} // namespace facebook
