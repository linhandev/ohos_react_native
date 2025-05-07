/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "TextComponentInstance.h"
#include <glog/logging.h>
#include <react/renderer/components/text/ParagraphProps.h>
#include <react/renderer/components/text/ParagraphState.h>
#include <react/renderer/core/ConcreteState.h>
#include <memory>
#include <sstream>
#include "RNOH/TextConversions.h"
#include "RNOH/TextMeasurer.h"
#include "react/renderer/attributedstring/primitives.h"

namespace rnoh {
const static float DEFAULT_LINE_SPACING = 0.15f;

TextComponentInstance::TextComponentInstance(Context context)
    : CppComponentInstance(std::move(context)) {
  m_textNode.setAlignment(ARKUI_ALIGNMENT_TOP_START);
  m_textNode.setTextOverflow(ARKUI_TEXT_OVERFLOW_ELLIPSIS);
}

TextComponentInstance::~TextComponentInstance() {
  this->disposeTextStorage();
}

void TextComponentInstance::onChildInserted(
    ComponentInstance::Shared const& /*childComponentInstance*/,
    std::size_t /*index*/) {
  throw RNOHError("TextComponentInstance does not support children");
}

void TextComponentInstance::onChildRemoved(
    ComponentInstance::Shared const& /*childComponentInstance*/) {
  throw RNOHError("TextComponentInstance does not support children");
}

const std::string& TextComponentInstance::getAccessibilityLabel() const {
  auto const& superAccessibilityLabel =
      CppComponentInstance::getAccessibilityLabel();
  return superAccessibilityLabel.empty() ? m_textContent
                                         : superAccessibilityLabel;
}

void TextComponentInstance::onPropsChanged(
    SharedConcreteProps const& textProps) {
  CppComponentInstance::onPropsChanged(textProps);
  if (textProps == nullptr) {
    return;
  }
  // padding
  TextPaddingInfo info = TextConversions::getArkUIPadding(textProps);
  VLOG(3) << "[text-debug] textProps->setPadding top=" << info.top
          << ", right=" << info.right << ", bottom=" << info.bottom
          << ", left=" << info.left;
  m_textNode.setPadding(info.top, info.right, info.bottom, info.left);

  // Copy Option
  VLOG(3) << "[text-debug] textProps->isSelectable=" << textProps->isSelectable;
  int32_t testCopyOption = ArkUI_CopyOptions::ARKUI_COPY_OPTIONS_NONE;
  if (textProps->isSelectable) {
    testCopyOption = ArkUI_CopyOptions::ARKUI_COPY_OPTIONS_LOCAL_DEVICE;
  }
  m_textNode.setTextCopyOption(testCopyOption);

  if (textProps->rawProps != nullptr) {
    // stack align
    facebook::react::TextAlignment alignHorizon =
        facebook::react::TextAlignment::Left;
    if (textProps->rawProps.count("writingDirection") != 0 &&
        textProps->rawProps["writingDirection"] == "rtl") {
      alignHorizon = facebook::react::TextAlignment::Right;
    }
    std::string alignVertical = "top";
    if (textProps->rawProps.count("textAlignVertical") != 0 &&
        textProps->rawProps["textAlignVertical"].isString()) {
      alignVertical = textProps->rawProps["textAlignVertical"].asString();
    }
    if (textProps->textAttributes.alignment.has_value()) {
      alignHorizon = textProps->textAttributes.alignment.value();
    }
    auto alignment = TextConversions::getAlignment(alignHorizon, alignVertical);

    facebook::react::TextAlignment alignHorizonOld =
        facebook::react::TextAlignment::Left;
    std::string alignVerticalOld = "top";
    if (m_props->rawProps.count("textAlignVertical") != 0 &&
        m_props->rawProps["textAlignVertical"].isString()) {
      alignVerticalOld = m_props->rawProps["textAlignVertical"].asString();
    }
    if (m_props->textAttributes.alignment.has_value()) {
      alignHorizonOld = m_props->textAttributes.alignment.value();
    }
    auto oldAlignment =
        TextConversions::getAlignment(alignHorizonOld, alignVerticalOld);

    if (alignment != oldAlignment) {
      VLOG(3) << "[text-debug] alignment=" << alignment
              << ", oldAlignment=" << oldAlignment;
      m_textNode.setAlignment(alignment);
    }

    // enable
    if (textProps->rawProps.count("disabled") != 0) {
      bool enableFlag = textProps->rawProps["disabled"].asBool();
      VLOG(3) << "[text-debug] rawProps->disabled=" << enableFlag;
      m_textNode.setTextEnable(!enableFlag);
    }

    // selectionColor
    if (textProps->rawProps.count("selectionColor") != 0 &&
        !textProps->rawProps["selectionColor"].isNull()) {
      uint32_t selectionColor = textProps->rawProps["selectionColor"].asInt();
      selectionColor = (selectionColor & 0x00ffffff) | 0x33000000;
      VLOG(3) << "[text-debug] selectionColor: " << selectionColor;
      m_textNode.setSelectedBackgroundColor(selectionColor);
    }

    // dataDetectorType
    if (textProps->rawProps.count("dataDetectorType") != 0) {
      auto dataDetectorType = textProps->rawProps["dataDetectorType"];
      VLOG(3) << "[text-debug] dataDetectorType: "
              << dataDetectorType.asString();
      auto dataDetectorEnable =
          TextConversions::getArkUITextDataDetectorEnable(dataDetectorType);
      VLOG(3) << "[text-debug] dataDetectorEnable: " << dataDetectorEnable;
      m_textNode.setTextDataDetectorEnable(dataDetectorEnable);
      if (dataDetectorEnable) {
        auto arkUIDataDetectorType =
            TextConversions::getArkUITextDataDetectorTypes(dataDetectorType);
        if (arkUIDataDetectorType.has_value()) {
          VLOG(3) << "[text-debug] arkUIDataDetectorType: "
                  << arkUIDataDetectorType.value();
          m_textNode.setTextDataDetectorType(arkUIDataDetectorType.value());
        }
      }
    }
  }

  VLOG(3) << "[text-debug] setProps end";
}

void TextComponentInstance::onFinalizeUpdates() {
  CppComponentInstance::onFinalizeUpdates();
  auto parent = m_parent.lock();
  if (m_props->importantForAccessibility ==
          facebook::react::ImportantForAccessibility::Auto &&
      parent && !parent->getAccessibilityGroup()) {
    m_textNode.setAccessibilityMode(
        ArkUI_AccessibilityMode::ARKUI_ACCESSIBILITY_MODE_ENABLED);
  }
}

void TextComponentInstance::onStateChanged(
    SharedConcreteState const& textState) {
  CppComponentInstance::onStateChanged(textState);
  m_touchTargetChildrenNeedUpdate = true;
  auto const& stateData = textState->getData();
  auto const& fragments = stateData.attributedString.getFragments();
  if (fragments.empty()) {
    m_textNode.resetTextContentWithStyledString();
    this->disposeTextStorage();
    return;
  }
  auto const& paragraphLayoutManager = stateData.layoutManager.lock();
  facebook::react::LayoutConstraints layoutConstraints = {
      m_layoutMetrics.frame.size, m_layoutMetrics.frame.size};

  auto textMeasurer = static_cast<const TextMeasurer*>(
      paragraphLayoutManager->getNativeTextLayoutManager());
  RNOH_ASSERT(textMeasurer);

  this->disposeTextStorage();
  /**
   * TODO: reuse measurer's TextStorage
   * https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/1482
   */
  m_textStorage = textMeasurer->createTextStorage(
      stateData.attributedString,
      stateData.paragraphAttributes,
      layoutConstraints);

  RNOH_ASSERT(m_textStorage.has_value());
  m_textNode.setTextContentWithStyledString(
      m_textStorage.value().styledString.get());
  std::stringstream ss;
  for (auto const& fragment : fragments) {
    ss << fragment.string;
  }
  m_textContent = ss.str();
  m_textNode.setTextContent(m_textContent);

  this->setTextAttributes(fragments[0].textAttributes);
}

void TextComponentInstance::setTextAttributes(
    const facebook::react::TextAttributes& textAttributes) {
  // TextAlign
  if (textAttributes.alignment.has_value()) {
    int32_t align = TextConversions::getArkUITextAlignment(
        textAttributes.alignment.value());
    VLOG(3) << "[text-debug] textAttributes.alignment=" << align;
    m_textNode.setTextAlign(align);
  }
}

TextNode& TextComponentInstance::getLocalRootArkUINode() {
  return m_textNode;
}

class TextFragmentTouchTarget : public TouchTarget {
 public:
  TextFragmentTouchTarget(
      facebook::react::Tag tag,
      TouchTarget::Weak parentTouchTarget,
      facebook::react::SharedTouchEventEmitter touchEventEmitter)
      : m_tag(tag),
        m_touchEventEmitter(std::move(touchEventEmitter)),
        m_parentTouchTarget(parentTouchTarget) {}

  void clearRects() {
    m_rects.clear();
  }

  void insertRects(std::vector<facebook::react::Rect> const& rects) {
    m_rects.insert(m_rects.end(), rects.begin(), rects.end());
  }

  facebook::react::SharedTouchEventEmitter getTouchEventEmitter()
      const override {
    return m_touchEventEmitter;
  }

  facebook::react::Point computeChildPoint(
      facebook::react::Point const& point,
      TouchTarget::Shared const& /*child*/) const override {
    return point;
  }

  bool containsPoint(facebook::react::Point const& point) const override {
    for (auto rect : m_rects) {
      if (rect.containsPoint(point)) {
        return true;
      }
    }
    return false;
  }

  bool containsPointInBoundingBox(
      facebook::react::Point const& point) override {
    return containsPoint(point);
  }

  bool canHandleTouch() const override {
    return m_touchEventEmitter != nullptr;
  }

  bool canChildrenHandleTouch() const override {
    return false;
  }

  bool canSubtreeHandleTouch(facebook::react::Point const& point) override {
    return false;
  }

  facebook::react::Tag getTouchTargetTag() const override {
    return m_tag;
  }

  TouchTarget::Shared getTouchTargetParent() const override {
    return m_parentTouchTarget.lock();
  };

  std::vector<TouchTarget::Shared> getTouchTargetChildren() override {
    return {};
  }

  facebook::react::LayoutMetrics getLayoutMetrics() const override {
    return {};
  }

  facebook::react::Transform getTransform() const override {
    return {};
  }

  facebook::react::Rect getBoundingBox() override {
    return {};
  };

  bool isClippingSubviews() const override {
    return false;
  }

  void markBoundingBoxAsDirty() override{};

 private:
  facebook::react::Tag m_tag;
  facebook::react::SharedTouchEventEmitter m_touchEventEmitter;
  std::vector<facebook::react::Rect> m_rects{};
  TouchTarget::Weak m_parentTouchTarget;
};

std::vector<TouchTarget::Shared>
TextComponentInstance::getTouchTargetChildren() {
  if (m_state == nullptr) {
    m_fragmentTouchTargetByTag.clear();
    return {};
  }

  if (m_touchTargetChildrenNeedUpdate) {
    m_touchTargetChildrenNeedUpdate = false;
    updateFragmentTouchTargets(m_state->getData());
  }

  auto const& fragments = m_state->getData().attributedString.getFragments();

  auto attachmentCount = 0;
  std::vector<TouchTarget::Shared> result;
  for (auto const& fragment : fragments) {
    if (!fragment.isAttachment()) {
      result.push_back(
          m_fragmentTouchTargetByTag.at(fragment.parentShadowView.tag));
    }
  }
  result.insert(result.end(), m_children.begin(), m_children.end());
  return result;
}

void TextComponentInstance::updateFragmentTouchTargets(
    facebook::react::ParagraphState const& newState) {
  auto const& fragments = newState.attributedString.getFragments();
  if (!m_textStorage.has_value() || fragments.empty()) {
    m_fragmentTouchTargetByTag.clear();
    return;
  }

  auto const& typography = m_textStorage->arkUITypography;
  auto rects = typography.getRectsForFragments();

  FragmentTouchTargetByTag touchTargetByTag;
  size_t textFragmentCount = 0;
  for (auto const& fragment : fragments) {
    if (fragment.isAttachment()) {
      continue;
    }
    auto index = textFragmentCount;
    auto eventEmitter =
        std::dynamic_pointer_cast<const facebook::react::TouchEventEmitter>(
            fragment.parentShadowView.eventEmitter);
    auto tag = fragment.parentShadowView.tag;
    auto touchTargetEntry = touchTargetByTag.find(tag);

    if (touchTargetEntry == touchTargetByTag.end()) {
      // if no entry has been inserted yet into the new map
      if (auto prevTouchTarget = m_fragmentTouchTargetByTag.find(tag);
          prevTouchTarget != m_fragmentTouchTargetByTag.end()) {
        // either reuse the existing touch target if there was a fragment with
        // the same tag
        auto fragmentTouchTarget =
            std::static_pointer_cast<TextFragmentTouchTarget>(
                prevTouchTarget->second);
        fragmentTouchTarget->clearRects();
        touchTargetEntry =
            touchTargetByTag.try_emplace(tag, std::move(fragmentTouchTarget))
                .first;
      } else {
        // or create a new one for a new fragment tag
        auto newTouchTarget = std::make_shared<TextFragmentTouchTarget>(
            tag, this->shared_from_this(), eventEmitter);
        touchTargetEntry =
            touchTargetByTag.try_emplace(tag, std::move(newTouchTarget)).first;
      }
    }

    auto fragmentTouchTarget =
        std::static_pointer_cast<TextFragmentTouchTarget>(
            touchTargetEntry->second);
    fragmentTouchTarget->insertRects(rects.at(index));
    textFragmentCount++;
  }
  m_fragmentTouchTargetByTag = std::move(touchTargetByTag);
}

void TextComponentInstance::disposeTextStorage() {
  m_deps->taskExecutor->runDelayedTask(
      TaskThread::MAIN,
      [textStorage = std::move(m_textStorage)]() {
        /**
         * ApplyIndent crash
         *
         * After updating RN to 0.77, the tester application started crashing on
         * certain pages. The crash occurs on the platform side in
         * MultipleParagraphLayoutAlgorithm::ApplyIndent. It can be reproduced
         * by navigating to the AppRegistry page in the RNOH tester app (the All
         * Tests page doesn't crash). The
         * MultipleParagraphLayoutAlgorithm::ApplyIndent method is called on the
         * VSync thread. Commenting out OH_Drawing_DestroyTypography in
         * ArkUITypography eliminated this problem, however, it introduced a
         * massive memory leak.
         *
         * My hypothesis is that some internal platform objects are kept
         * indirectly by textStorage and need to be alive when
         * MultipleParagraphLayoutAlgorithm::ApplyIndent is called.
         *
         * TextMeasurer in RN v0.72.5 supported hostTextStorage, but this
         * concept was removed in RN v0.75. For some reason, no crashes were
         * observed in RNOH v0.75 or v0.76...
         */
      },
      1000);
  m_textStorage = std::nullopt;
}
} // namespace rnoh
