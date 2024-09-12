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
    AttributedStringBox attributedStringBox,
    ParagraphAttributes paragraphAttributes,
    LayoutConstraints layoutConstraints) const {
  return measure(
      attributedStringBox, paragraphAttributes, layoutConstraints, nullptr);
}

TextMeasurement TextLayoutManager::measure(
    AttributedStringBox attributedStringBox,
    ParagraphAttributes paragraphAttributes,
    LayoutConstraints layoutConstraints,
    std::shared_ptr<void> hostTextStorage) const {
  auto& attributedString = attributedStringBox.getValue();
  return m_textLayoutManagerDelegate->measure(
      attributedString,
      paragraphAttributes,
      layoutConstraints,
      std::move(hostTextStorage));
}

LinesMeasurements TextLayoutManager::measureLines(
    AttributedString attributedString,
    ParagraphAttributes paragraphAttributes,
    Size size) const {
  return {};
}

std::shared_ptr<void> TextLayoutManager::getHostTextStorage(
    AttributedString attributedString,
    ParagraphAttributes paragraphAttributes,
    LayoutConstraints layoutConstraints) const {
  return m_textLayoutManagerDelegate->getHostTextStorage(
      attributedString, paragraphAttributes, layoutConstraints);
}

} // namespace react
} // namespace facebook
