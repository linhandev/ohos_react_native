/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include "TextInputNodeBase.h"
#include "react/renderer/components/textinput/TextInputProps.h"
#include "react/renderer/graphics/Color.h"

namespace rnoh {
/**
 * @api
 */
class TextInputNodeDelegate {
 public:
  virtual ~TextInputNodeDelegate() = default;

  virtual void onChange(ArkUINode* node, const std::string& text) {}

  virtual void onBlur(ArkUINode* node) {}

  virtual void onFocus(ArkUINode* node) {}

  virtual void onSubmit(ArkUINode* node) {}

  virtual void onPasteOrCut(ArkUINode* node) {}

  virtual void onContentScroll(ArkUINode* node) {}

  virtual void onContentSizeChange(ArkUINode* node, float width, float height) {
  }

  virtual void
  onTextSelectionChange(ArkUINode* node, int32_t location, int32_t length) {}

  /**
   * @Deprecated: use onChange(ArkUINode*, const std::string&).
   * Deprecated when preparing 0.77 for release.
   */
  virtual void onChange(std::string text) {}

  /**
   * @Deprecated: use onBlur(ArkUINode*).
   * Deprecated when preparing 0.77 for release.
   */
  virtual void onBlur() {}

  /**
   * @Deprecated: use onFocus(ArkUINode*).
   * Deprecated when preparing 0.77 for release.
   */
  virtual void onFocus() {}

  /**
   * @Deprecated: use onSubmit(ArkUINode*).
   * Deprecated when preparing 0.77 for release.
   */
  virtual void onSubmit() {}

  /**
   * @Deprecated: use onPasteOrCut(ArkUINode*).
   * Deprecated when preparing 0.77 for release.
   */
  virtual void onPasteOrCut() {}

  /**
   * @Deprecated: use onContentScroll(ArkUINode*).
   * Deprecated when preparing 0.77 for release.
   */
  virtual void onContentScroll() {}

  /**
   * @Deprecated: use onContentSizeChange(ArkUINode*, float, float).
   * Deprecated when preparing 0.77 for release.
   */
  virtual void onContentSizeChange(float width, float height, bool multiline) {}

  /**
   * @Deprecated: use onTextSelectionChange(ArkUINode*, int32_t,
   * int32_t). Deprecated when preparing 0.77 for release.
   */
  virtual void onTextSelectionChange(int32_t location, int32_t length) {}
};

/**
 * @api
 */
class TextInputNode : public TextInputNodeBase {
 private:
  uint32_t m_caretColorValue;
  bool m_setTextContent{false};
  std::string m_textContent;

 protected:
  TextInputNodeDelegate* m_textInputNodeDelegate;

 public:
  TextInputNode();
  ~TextInputNode() override;

  facebook::react::Point getTextInputOffset() const;

  facebook::react::Rect getTextContentRect() const override;

  void onNodeEvent(ArkUI_NodeEventType eventType, EventArgs& eventArgs)
      override;

  void onNodeEvent(ArkUI_NodeEventType eventType, std::string_view eventString)
      override;

  void setTextInputNodeDelegate(TextInputNodeDelegate* textInputNodeDelegate);

  void setTextContent(std::string const& textContent);

  void setCaretHidden(bool hidden);

  void setInputType(
      facebook::react::KeyboardType keyboardType,
      bool securityEntry);

  void setInputType(ArkUI_TextInputType keyboardType);

  void setSelectedBackgroundColor(facebook::react::SharedColor const& color);

  void setPasswordIconVisibility(bool isVisible);

  void setEnterKeyType(
      facebook::react::ReturnKeyType returnKeyType,
      std::string returnKeyLabel);

  void setEnterKeyType(ArkUI_EnterKeyType returnKeyType);

  void setCancelButtonMode(
      facebook::react::TextInputAccessoryVisibilityMode mode);

  void setFont(facebook::react::TextAttributes const& textAttributes) override;

  void setCaretColor(facebook::react::SharedColor const& color) override;

  void setMaxLength(int32_t maxLength) override;

  void setPlaceholder(std::string const& placeholder) override;

  void setPlaceholderColor(facebook::react::SharedColor const& color) override;

  void resetSelectedBackgroundColor();

  void setTextContentType(std::string const& textContentType);

  void setContextMenuHidden(bool hidden);

  /**
   * @Deprecated: use setContextMenuHidden.
   * Deprecated when preparing 0.77 for release.
   */
  inline void SetContextMenuHidden(bool hidden) {
    this->setContextMenuHidden(hidden);
  }

  void setBlurOnSubmit(bool blurOnSubmit);

  void setLineHeight(float lineHeight);

  void setAutoFill(bool autoFill);

  void setAutoFill(std::string const& autoFill);

  /**
   * @Deprecated: use setShowKeyboardOnFocus
   * Deprecated when preparing 0.77 branch for release.
   */
  inline void setshowSoftInputOnFocus(bool enable) {
    this->setShowKeyboardOnFocus(enable);
  }

  void setInputFilter(std::string const& inputFilter);

  void setUnderlineColor(facebook::react::SharedColor const& underlineColor);
  /**
   * @Deprecated: use setUnderlineColor.
   * Deprecated when preparing 0.77 for release.
   */
  inline void setUnderlineColorAndroid(
      facebook::react::SharedColor const& underlineColorAndroid) {
    this->setUnderlineColor(underlineColorAndroid);
  }

  void setShowKeyboardOnFocus(bool enable);

  void setPasswordRules(const std::string rules);

  std::string getTextContent() override;

  static ArkUI_EnterKeyType convertEnterKeyLabel(std::string returnKeyLabel);

  static uint32_t convertColorToTranslucentUnderline(
      facebook::react::SharedColor const& color);

  static uint32_t convertColorToTranslucentSelection(
      facebook::react::SharedColor const& color);

  static ArkUI_NumberValue convertContentType(
      std::string const& textContentType);
};

} // namespace rnoh