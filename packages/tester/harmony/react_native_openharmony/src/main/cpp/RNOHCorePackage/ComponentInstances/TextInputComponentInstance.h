/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include "RNOH/CppComponentInstance.h"
#include "RNOH/arkui/TextAreaNode.h"
#include "RNOH/arkui/TextInputNode.h"
#include "ScrollViewComponentInstance.h"
#include "react/renderer/components/textinput/TextInputEventEmitter.h"
#include "react/renderer/components/textinput/TextInputShadowNode.h"

namespace rnoh {
class TextInputComponentInstance
    : public CppComponentInstance<facebook::react::TextInputShadowNode>,
      public TextInputNodeDelegate,
      public TextAreaNodeDelegate,
      public ArkTSMessageHub::Observer,
      public KeyboardAvoider {
 private:
  TextInputNode m_textInputNode;
  TextAreaNode m_textAreaNode;
  bool m_multiline{false};

  int32_t m_nativeEventCount = 0;

  static std::string getTextContentFromState(SharedConcreteState const& state);
  facebook::react::TextInputEventEmitter::Metrics getTextInputMetrics();
  facebook::react::Size getOnContentSizeChangeMetrics();

  bool m_secureInput{false};

  bool m_clearTextOnFocus{false};

  std::string m_content;

  int32_t m_selectionLocation = 0;

  int32_t m_selectionLength = 0;

  float m_contentSizeWidth = 0;
  float m_contentSizeHeight = 0;

  bool m_textWasPastedOrCut = false;
  bool m_valueChanged = false;

  bool m_focused{false};
  bool m_shouldIgnoreNextChangeEvent = false;

  size_t m_selectionStart = -1;
  size_t m_selectionEnd = -1;

  void focus();
  void blur();

  void setTextContentAndSelection(
      std::string const& content,
      size_t selectionStart,
      size_t selectionEnd);
  void setTextContent(std::string const& content);

 public:
  TextInputComponentInstance(Context context);

  void onPropsChanged(SharedConcreteProps const& props) override;

  void onStateChanged(SharedConcreteState const& state) override;

  void onLayoutChanged(
      facebook::react::LayoutMetrics const& layoutMetrics) override;

  void onCommandReceived(
      std::string const& commandName,
      folly::dynamic const& args) override;

  void onChange(ArkUINode* node, const std::string& text) override;

  void onBlur(ArkUINode* node) override;

  void onSubmit(ArkUINode* node) override;

  void onFocus(ArkUINode* node) override;

  void onPasteOrCut(ArkUINode* node) override;

  void onTextSelectionChange(ArkUINode* node, int32_t location, int32_t length)
      override;
  void onContentSizeChange(ArkUINode* node, float width, float height) override;

  void onContentScroll(ArkUINode* node) override;

  ArkUINode& getLocalRootArkUINode() override;

  void onMessageReceived(ArkTSMessage const& message) override;

  // KeyboardAvoider
  facebook::react::Float getBottomEdgeOffsetRelativeToScrollView(
      std::shared_ptr<ScrollViewComponentInstance> scrollView) override;
};
} // namespace rnoh