/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "TextLayoutManager.h"

namespace facebook {
namespace react {

void* TextLayoutManager::getNativeTextLayoutManager() const {
  return (void*)m_textLayoutManagerDelegate.get();
}

TextMeasurement TextLayoutManager::measure(
    const AttributedStringBox& attributedStringBox,
    const ParagraphAttributes& paragraphAttributes,
    const TextLayoutContext& layoutContext,
    LayoutConstraints layoutConstraints) const {
  return m_textLayoutManagerDelegate->measure(
      attributedStringBox,
      paragraphAttributes,
      layoutContext,
      std::move(layoutConstraints));
}

TextMeasurement TextLayoutManager::measureCachedSpannableById(
    int64_t /*cacheId*/,
    const ParagraphAttributes& /*paragraphAttributes*/,
    LayoutConstraints /*layoutConstraints*/) const {
  return {};
}

LinesMeasurements TextLayoutManager::measureLines(
    const AttributedStringBox& attributedStringBox,
    const ParagraphAttributes& paragraphAttributes,
    const Size& size) const {
  return {};
};

Float TextLayoutManager::baseline(
    const AttributedStringBox& /*attributedStringBox*/,
    const ParagraphAttributes& /*paragraphAttributes*/,
    const Size& /*size*/) const {
  return 0;
}

} // namespace react
} // namespace facebook
