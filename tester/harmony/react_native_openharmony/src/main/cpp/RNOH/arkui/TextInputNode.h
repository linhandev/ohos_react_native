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
  virtual void onChange(std::string text){};
  virtual void onBlur(){};
  virtual void onFocus(){};
  virtual void onSubmit(){};
  virtual void onPasteOrCut(){};
  virtual void onContentScroll(){};
  virtual void onContentSizeChange(float width, float height){};

  virtual void onTextSelectionChange(int32_t location, int32_t length){};
};

/**
 * @api
 */
class TextInputNode : public TextInputNodeBase {
 private:
  uint32_t m_caretColorValue;

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

  void setSelectedBackgroundColor(facebook::react::SharedColor const& color);

  void setPasswordIconVisibility(bool isVisible);

  void setEnterKeyType(
      facebook::react::ReturnKeyType returnKeyType,
      std::string returnKeyLabel);

  void setCancelButtonMode(
      facebook::react::TextInputAccessoryVisibilityMode mode);

  void setFont(
      facebook::react::TextAttributes const& textAttributes,
      float fontSizeScale) override;

  void setCaretColor(facebook::react::SharedColor const& color) override;

  void setMaxLength(int32_t maxLength) override;

  void setPlaceholder(std::string const& placeholder) override;

  void setPlaceholderColor(facebook::react::SharedColor const& color) override;

  void resetSelectedBackgroundColor();

  void setTextContentType(std::string const& textContentType);

  void setContextMenuHidden(bool hidden);

  void setBlurOnSubmit(bool blurOnSubmit);

  void setLineHeight(float lineHeight);

  void setUnderlineColorAndroid(
      facebook::react::SharedColor const& underlineColorAndroid);

  void setAutoFill(bool autoFill);

  void setshowSoftInputOnFocus(bool enable);

  void setInputFilter(std::string const& inputFilter);

  void setUnderlineColor(
      facebook::react::SharedColor const& underlineColorAndroid);

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