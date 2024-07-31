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
  virtual void onChange(std::string text){};
  virtual void onBlur(){};
  virtual void onFocus(){};
  virtual void onPasteOrCut(){};
  virtual void onTextSelectionChange(int32_t location, int32_t length){};
  virtual void onContentScroll(){};
  virtual void onContentSizeChange(float width, float height){};
};

/**
 * @api
 */
class TextAreaNode : public TextInputNodeBase {
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

  void setFont(
      facebook::react::TextAttributes const& textAttributes,
      float fontSizeScale) override;

  void setCaretColor(facebook::react::SharedColor const& color) override;

  void setMaxLength(int32_t maxLength) override;

  void setPlaceholder(std::string const& placeholder) override;

  void setPlaceholderColor(facebook::react::SharedColor const& color) override;

  void defaultSetPadding();

  void setTextContentType(std::string const& textContentType);

  void setContextMenuHidden(bool hidden);

  void setBlurOnSubmit(bool blurOnSubmit);

  void setLineHeight(float lineHeight);

  void setEnterKeyType(
      facebook::react::ReturnKeyType returnKeyType,
      std::string returnKeyLabel);

  void setUnderlineColor(facebook::react::SharedColor const& underlineColor);

  void setAutoFill(bool autoFill);

  void setShowKeyboardOnFocus(bool enable);

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