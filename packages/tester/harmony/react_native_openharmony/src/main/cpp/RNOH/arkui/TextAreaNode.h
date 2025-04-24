/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include "ArkUINode.h"
#include "TextInputNodeBase.h"
#include "react/renderer/components/textinput/TextInputEventEmitter.h"
#include "react/renderer/components/textinput/TextInputProps.h"
#include "react/renderer/graphics/Color.h"

namespace rnoh {
/**
 * @api
 */
class TextAreaNodeDelegate {
 public:
  virtual ~TextAreaNodeDelegate() = default;

  virtual void onChange(ArkUINode* node, const std::string& text) {}
  virtual void onBlur(ArkUINode* node) {}
  virtual void onFocus(ArkUINode* node) {}
  virtual void onPasteOrCut(ArkUINode* node) {}
  virtual void
  onTextSelectionChange(ArkUINode* node, int32_t location, int32_t length) {}
  virtual void onContentScroll(ArkUINode* node) {}
  virtual void onContentSizeChange(ArkUINode* node, float width, float height) {
  }

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
   * @Deprecated: use onPasteOrCut(ArkUINode*).
   * Deprecated when preparing 0.77 for release.
   */
  virtual void onPasteOrCut() {}
  /**
   * @Deprecated: use onTextSelectionChange(ArkUINode*, int32_t,
   * int32_t). Deprecated when preparing 0.77 for release.
   */
  virtual void onTextSelectionChange(int32_t location, int32_t length) {}
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
};

/**
 * @api
 */
class TextAreaNode : public TextInputNodeBase {
 private:
  bool m_setTextContent{false};
  std::string m_textContent;

 protected:
  TextAreaNodeDelegate* m_textAreaNodeDelegate;

 public:
  TextAreaNode();
  ~TextAreaNode() override;

  facebook::react::Point getTextAreaOffset() const;

  facebook::react::Rect getTextContentRect() const override;

  void onNodeEvent(ArkUI_NodeEventType eventType, EventArgs& eventArgs)
      override;

  void onNodeEvent(ArkUI_NodeEventType eventType, std::string_view eventString)
      override;

  void setTextAreaNodeDelegate(TextAreaNodeDelegate* textAreaNodeDelegate);

  void setTextContent(std::string const& textContent);

  void setInputType(facebook::react::KeyboardType keyboardType);

  void setInputType(ArkUI_TextAreaType keyboardType);

  void setFont(facebook::react::TextAttributes const& textAttributes) override;

  void setCaretColor(facebook::react::SharedColor const& color) override;

  void setMaxLength(int32_t maxLength) override;

  void setPlaceholder(std::string const& placeholder) override;

  void setPlaceholderColor(facebook::react::SharedColor const& color) override;

  void defaultSetPadding();

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

  void setEnterKeyType(
      facebook::react::ReturnKeyType returnKeyType,
      std::string returnKeyLabel);

  void setEnterKeyType(ArkUI_EnterKeyType returnKeyType);

  void setUnderlineColor(facebook::react::SharedColor const& underlineColor);
  /**
   * @Deprecated: use setUnderlineColor.
   * Deprecated when preparing 0.77 for release.
   */
  inline void setUnderlineColorAndroid(
      facebook::react::SharedColor const& underlineColorAndroid) {
    this->setUnderlineColor(underlineColorAndroid);
  };

  void setAutoFill(bool autoFill);

  void setAutoFill(std::string const& autoFill);

  void setShowKeyboardOnFocus(bool enable);
  /**
   * @Deprecated: use setShowKeyboardOnFocus
   * Deprecated when preparing 0.77 branch for release.
   */
  inline void setshowSoftInputOnFocus(bool enable) {
    this->setShowKeyboardOnFocus(enable);
  }

  void setInputFilter(std::string const& inputFilter);

  std::string getTextContent() override;

  static ArkUI_EnterKeyType convertTextAreaEnterKeyType(
      facebook::react::ReturnKeyType returnKeyType);

  static ArkUI_EnterKeyType convertTextAreaEnterKeyLabel(
      std::string returnKeyLabel);

  static ArkUI_TextAreaType convertTextAreaInputType(
      facebook::react::KeyboardType keyboardType);
};

} // namespace rnoh