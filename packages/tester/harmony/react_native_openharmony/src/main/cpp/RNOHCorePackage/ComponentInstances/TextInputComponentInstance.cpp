/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "TextInputComponentInstance.h"
#include <boost/locale.hpp>
#include <folly/dynamic.h>
#include <glog/logging.h>
#include <react/renderer/components/textinput/TextInputProps.h>
#include <react/renderer/components/textinput/TextInputState.h>
#include <react/renderer/core/ConcreteState.h>
#include <algorithm>
#include <sstream>
#include <utility>
#include "ScrollViewComponentInstance.h"
#include "conversions.h"
#include "react/renderer/components/textinput/primitives.h"

using RNTextVerticalAlignment = facebook::react::TextAlignmentVertical;

std::unordered_map<RNTextVerticalAlignment, ArkUI_Alignment>
    ARKUI_TEXT_ALIGNMENT_BY_RN_VERTICAL_TEXT_ALIGNMENT = {
        {RNTextVerticalAlignment::Auto, ARKUI_ALIGNMENT_CENTER},
        {RNTextVerticalAlignment::Top, ARKUI_ALIGNMENT_TOP},
        {RNTextVerticalAlignment::Bottom, ARKUI_ALIGNMENT_BOTTOM},
        {RNTextVerticalAlignment::Center, ARKUI_ALIGNMENT_CENTER}};

namespace rnoh {

TextInputComponentInstance::TextInputComponentInstance(Context context)
    : CppComponentInstance(std::move(context)),
      ArkTSMessageHub::Observer(m_deps->arkTSMessageHub) {
  m_textInputNode.setPadding(resolveEdges(
      [this](auto edge) { return m_props->yogaStyle.padding(edge); }));
  m_textAreaNode.setPadding(resolveEdges(
      [this](auto edge) { return m_props->yogaStyle.padding(edge); }));

  m_textAreaNode.setBackgroundColor(facebook::react::clearColor());
  m_textInputNode.setBackgroundColor(facebook::react::clearColor());
  m_textAreaNode.setCaretColor(facebook::react::blackColor());
  m_textInputNode.setCaretColor(facebook::react::blackColor());
}

void TextInputComponentInstance::onChange(
    ArkUINode* node,
    const std::string& text) {
  m_content = text;
  m_nativeEventCount++;
  if (m_eventEmitter) {
    m_eventEmitter->onChange(getTextInputMetrics());
  }
  m_valueChanged = true;
}

void TextInputComponentInstance::onSubmit(ArkUINode* node) {
  if (m_eventEmitter) {
    m_eventEmitter->onSubmitEditing(getTextInputMetrics());
  }
}

void TextInputComponentInstance::onBlur(ArkUINode* node) {
  this->m_focused = false;
  if (m_props->traits.clearButtonMode ==
      facebook::react::TextInputAccessoryVisibilityMode::WhileEditing) {
    m_textInputNode.setCancelButtonMode(
        facebook::react::TextInputAccessoryVisibilityMode::Never);
  } else if (
      m_props->traits.clearButtonMode ==
      facebook::react::TextInputAccessoryVisibilityMode::UnlessEditing) {
    m_textInputNode.setCancelButtonMode(
        facebook::react::TextInputAccessoryVisibilityMode::Always);
  }
  if (m_eventEmitter) {
    m_eventEmitter->onBlur(getTextInputMetrics());
    m_eventEmitter->onEndEditing(getTextInputMetrics());
  }
}

void TextInputComponentInstance::onFocus(ArkUINode* node) {
  this->m_focused = true;
  if (m_isControlledTextInput) {
    m_caretPositionForControlledInput = m_selectionStart.value();
  }
  if (this->m_clearTextOnFocus) {
    m_textAreaNode.setTextContent("");
    m_textInputNode.setTextContent("");
  }
  if (m_props->traits.selectTextOnFocus) {
    m_textInputNode.setTextSelection(0, m_content.size());
    m_textAreaNode.setTextSelection(0, m_content.size());
  }
  if (m_props->traits.clearButtonMode ==
      facebook::react::TextInputAccessoryVisibilityMode::WhileEditing) {
    m_textInputNode.setCancelButtonMode(m_props->traits.clearButtonMode);
  } else if (
      m_props->traits.clearButtonMode ==
      facebook::react::TextInputAccessoryVisibilityMode::UnlessEditing) {
    m_textInputNode.setCancelButtonMode(
        facebook::react::TextInputAccessoryVisibilityMode::Never);
  }
  if (m_eventEmitter) {
    m_eventEmitter->onFocus(getTextInputMetrics());
  }
}

void TextInputComponentInstance::onPasteOrCut(ArkUINode* node) {
  m_textWasPastedOrCut = true;
}

void TextInputComponentInstance::onWillDelete(
    ArkUINode* node,
    int position,
    int direction) {
  // onTextSelectionChange doesn't get triggered when backspace is pressed and
  // the TextInput is empty, so we cover that case here.
  if (m_eventEmitter && position == 0 && direction == 0) {
    auto keyPressMetrics =
        facebook::react::TextInputEventEmitter::KeyPressMetrics();
    m_nativeEventCount++;
    keyPressMetrics.text = "";
    keyPressMetrics.eventCount = m_nativeEventCount;
    m_eventEmitter->onKeyPress(keyPressMetrics);
  }
}

void TextInputComponentInstance::onTextSelectionChange(
    ArkUINode* node,
    int32_t location,
    int32_t length) {
  if (m_isControlledTextInput) {
    m_caretPositionForControlledInput = m_selectionStart.value();
  }
  if (m_textWasPastedOrCut) {
    m_textWasPastedOrCut = false;
  } else if (m_valueChanged) {
    std::u16string newCharUtf16;
    bool noPreviousSelection = m_selectionLength == 0;
    int32_t newCursorPosition = location;
    int32_t previousCursorPosition = m_selectionLocation;
    bool cursorDidNotMove = newCursorPosition == previousCursorPosition;
    bool cursorMovedBackwardsOrAtBeginningOfInput =
        (newCursorPosition < m_selectionLocation) || newCursorPosition <= 0;
    /**
     * Following part is to Check if cursor moved forward (not backward) and is
     * not at the start of input AND one of the following is true:
     * 1. There was no previous text selection (new input)
     * 2. Cursor position didn't change (possible input at same position)
     */
    if (!cursorMovedBackwardsOrAtBeginningOfInput &&
        (noPreviousSelection || !cursorDidNotMove)) {
      // Convert content to UTF-16 string to properly handle multi-byte
      // characters (emoji, Chinese characters, etc.)
      auto utfContent = boost::locale::conv::utf_to_utf<char16_t>(m_content);

      // Validate cursor position is within bounds
      if (newCursorPosition > 0 && newCursorPosition <= utfContent.size()) {
        // Calculate length of newly entered content:
        // Difference between current and previous cursor positions, minimum 1
        // char
        int onlyNewContentLength =
            std::max(newCursorPosition - previousCursorPosition, 1);

        // Ensure we don't exceed current position (bounds checking)
        onlyNewContentLength =
            std::min(onlyNewContentLength, newCursorPosition);

        // Extract the newly entered characters:
        // Takes substring from [location - length] to [location]
        // represents the most recently typed characters
        newCharUtf16 = utfContent.substr(
            newCursorPosition - onlyNewContentLength, onlyNewContentLength);
      }
    }
    auto keyPressMetrics =
        facebook::react::TextInputEventEmitter::KeyPressMetrics();
    keyPressMetrics.text = boost::locale::conv::utf_to_utf<char>(newCharUtf16);
    keyPressMetrics.eventCount = m_nativeEventCount;
    if (m_eventEmitter) {
      m_eventEmitter->onKeyPress(keyPressMetrics);
    }
  }
  if (m_valueChanged) {
    m_valueChanged = false;
  }

  m_selectionLocation = location;
  m_selectionLength = length;
  m_selectionStart = static_cast<size_t>(location);
  m_selectionEnd = static_cast<size_t>(location + length);
  if (m_eventEmitter) {
    m_eventEmitter->onSelectionChange(getTextInputMetrics());
  }
}

void TextInputComponentInstance::onContentSizeChange(
    ArkUINode* node,
    float width,
    float height) {
  bool calledByTextArea = (dynamic_cast<TextAreaNode*>(node) != nullptr);
  if (calledByTextArea == m_multiline) {
    m_contentSizeWidth = width;
    m_contentSizeHeight = height;
    if (m_eventEmitter) {
      m_eventEmitter->onContentSizeChange(getTextInputMetrics());
    }
  }
}

void TextInputComponentInstance::onContentScroll(ArkUINode* node) {
  if (m_eventEmitter) {
    m_eventEmitter->onScroll(getTextInputMetrics());
  }
}

std::string TextInputComponentInstance::getTextContentFromState(
    SharedConcreteState const& state) {
  std::ostringstream contentStream;
  for (auto const& fragment :
       state->getData().attributedStringBox.getValue().getFragments()) {
    contentStream << fragment.string;
  }
  return contentStream.str();
}

facebook::react::TextInputEventEmitter::Metrics
TextInputComponentInstance::getTextInputMetrics() {
  auto textInputMetrics = facebook::react::TextInputEventEmitter::Metrics();
  auto contentOffset = m_multiline
      ? m_textAreaNode.getTextContentRect().origin
      : m_textInputNode.getTextContentRect().origin;
  float pointScaleFactor = m_layoutMetrics.pointScaleFactor;
  auto padding = m_layoutMetrics.contentInsets - m_layoutMetrics.borderWidth;
  contentOffset.x = contentOffset.x / pointScaleFactor - padding.left;
  contentOffset.y = contentOffset.y / pointScaleFactor - padding.top;
  contentOffset.x = std::max<float>(-contentOffset.x, 0.0f);
  contentOffset.y = std::max<float>(-contentOffset.y, 0.0f);
  textInputMetrics.contentOffset = contentOffset;
  textInputMetrics.containerSize = m_layoutMetrics.frame.size;

  textInputMetrics.eventCount = this->m_nativeEventCount;
  textInputMetrics.selectionRange.location = this->m_selectionLocation;
  textInputMetrics.selectionRange.length = this->m_selectionLength;
  textInputMetrics.contentSize.width = this->m_contentSizeWidth;
  textInputMetrics.contentSize.height = this->m_contentSizeHeight;
  textInputMetrics.zoomScale = 1;
  textInputMetrics.text = m_multiline ? m_textAreaNode.getTextContent()
                                      : m_textInputNode.getTextContent();
  return textInputMetrics;
}

facebook::react::Size
TextInputComponentInstance::getOnContentSizeChangeMetrics() {
  auto OnContentSizeChangeMetrics = facebook::react::Size();
  OnContentSizeChangeMetrics.width = this->m_contentSizeWidth;
  OnContentSizeChangeMetrics.height = this->m_contentSizeHeight;
  return OnContentSizeChangeMetrics;
}

void TextInputComponentInstance::onPropsChanged(
    SharedConcreteProps const& props) {
  m_multiline = props->traits.multiline;
  m_isControlledTextInput = !props->text.empty();
  if (m_multiline) {
    m_textInputNode.setTextInputNodeDelegate(nullptr);
    m_textAreaNode.setTextAreaNodeDelegate(this);
  } else {
    m_textInputNode.setTextInputNodeDelegate(this);
    m_textAreaNode.setTextAreaNodeDelegate(nullptr);
  }
  CppComponentInstance::onPropsChanged(props);
  m_clearTextOnFocus = props->traits.clearTextOnFocus;

  if (props->traits.contextMenuHidden != m_props->traits.contextMenuHidden) {
    m_textInputNode.setContextMenuHidden(props->traits.contextMenuHidden);
    m_textAreaNode.setContextMenuHidden(props->traits.contextMenuHidden);
  }
  if (props->traits.passwordRules != m_props->traits.passwordRules) {
    m_textInputNode.setPasswordRules(props->traits.passwordRules);
  }
  if (*(props->textAttributes.foregroundColor) !=
      *(m_props->textAttributes.foregroundColor)) {
    if (props->textAttributes.foregroundColor) {
      m_textAreaNode.setFontColor(props->textAttributes.foregroundColor);
      m_textInputNode.setFontColor(props->textAttributes.foregroundColor);
    } else {
      m_textAreaNode.setFontColor(facebook::react::blackColor());
      m_textInputNode.setFontColor(facebook::react::blackColor());
    }
  }
  if (props->textAttributes != m_props->textAttributes) {
    auto fontSizeScale =
        this->m_deps->displayMetricsManager->getDisplayMetrics()
            .windowPhysicalPixels.fontScale;
    m_textAreaNode.setFont(props->getEffectiveTextAttributes(fontSizeScale));
    m_textInputNode.setFont(props->getEffectiveTextAttributes(fontSizeScale));
  }
  if (!m_props ||
      props->textAttributes.lineHeight != m_props->textAttributes.lineHeight) {
    if (props->textAttributes.lineHeight) {
      auto fontSizeScale =
          this->m_deps->displayMetricsManager->getDisplayMetrics()
              .windowPhysicalPixels.fontScale;
      m_textAreaNode.setTextInputLineHeight(
          props->getEffectiveTextAttributes(fontSizeScale));
      m_textInputNode.setTextInputLineHeight(
          props->getEffectiveTextAttributes(fontSizeScale));
    }
  }
  if (*(props->backgroundColor) != *(m_props->backgroundColor)) {
    if (props->backgroundColor) {
      m_textAreaNode.setBackgroundColor(props->backgroundColor);
      m_textInputNode.setBackgroundColor(props->backgroundColor);
    } else {
      m_textAreaNode.setBackgroundColor(facebook::react::clearColor());
      m_textInputNode.setBackgroundColor(facebook::react::clearColor());
    }
  }
  if (props->textAttributes.alignment) {
    if (*(props->textAttributes.alignment) !=
        *(m_props->textAttributes.alignment)) {
      m_textAreaNode.setTextAlign(props->textAttributes.alignment);
      m_textInputNode.setTextAlign(props->textAttributes.alignment);
    }
  }
  if (props->textAttributes.textAlignVertical !=
      m_props->textAttributes.textAlignVertical) {
    ArkUI_Alignment alignmentVertical =
        ARKUI_TEXT_ALIGNMENT_BY_RN_VERTICAL_TEXT_ALIGNMENT
            [props->textAttributes.textAlignVertical.value()];
    m_textInputNode.setAlignment(alignmentVertical);
    m_textAreaNode.setAlignment(alignmentVertical);
  }
  if (*(props->cursorColor) != *(m_props->cursorColor)) {
    if (props->cursorColor) {
      m_textAreaNode.setCaretColor(props->cursorColor);
      m_textInputNode.setCaretColor(props->cursorColor);
    } else {
      m_textAreaNode.setCaretColor(facebook::react::blackColor());
      m_textInputNode.setCaretColor(facebook::react::blackColor());
    }
  }
  if (props->traits.keyboardType != m_props->traits.keyboardType) {
    if (m_multiline) {
      m_textAreaNode.setInputType(props->traits.keyboardType);
    } else {
      m_textInputNode.setInputType(
          props->traits.keyboardType, props->traits.secureTextEntry);
      ;
    }
  }
  if (!m_props || props->maxLength != m_props->maxLength) {
    if (!props->maxLength) {
      m_textAreaNode.resetMaxLength();
      m_textInputNode.resetMaxLength();
    } else {
      m_textAreaNode.setMaxLength(props->maxLength);
      m_textInputNode.setMaxLength(props->maxLength);
    }
  }
  if (props->placeholder != m_props->placeholder) {
    m_textAreaNode.setPlaceholder(props->placeholder);
    m_textInputNode.setPlaceholder(props->placeholder);
  }
  if (props->placeholderTextColor) {
    if (*(props->placeholderTextColor) != *(m_props->placeholderTextColor)) {
      m_textAreaNode.setPlaceholderColor(props->placeholderTextColor);
      m_textInputNode.setPlaceholderColor(props->placeholderTextColor);
    }
  }
  if (props->rawProps.count("focusable") > 0) {
    if (m_props->rawProps.count("focusable") == 0 ||
        props->rawProps["focusable"].asBool() !=
            m_props->rawProps["focusable"].asBool()) {
      m_textAreaNode.setFocusable(props->rawProps["focusable"].asBool());
      m_textInputNode.setFocusable(props->rawProps["focusable"].asBool());
    }
  }
  m_textAreaNode.setId(getIdFromProps(props));
  m_textInputNode.setId(getIdFromProps(props));

  if (props->autoFocus != m_props->autoFocus) {
    if (m_multiline) {
      m_textAreaNode.setAutoFocus(props->autoFocus);
    } else {
      m_textInputNode.setAutoFocus(props->autoFocus);
    }
  }

  if (*(props->selectionColor) != *(m_props->selectionColor)) {
    if (props->selectionColor) {
      m_textInputNode.setSelectedBackgroundColor(props->selectionColor);
      if (!props->cursorColor) {
        m_textInputNode.setCaretColor(props->selectionColor);
        m_textAreaNode.setCaretColor(props->selectionColor);
      }
    } else {
      m_textInputNode.resetSelectedBackgroundColor();
    }
  }
  if (props->traits.secureTextEntry != m_props->traits.secureTextEntry ||
      props->traits.keyboardType != m_props->traits.keyboardType) {
    m_textInputNode.setInputType(
        props->traits.keyboardType, props->traits.secureTextEntry);
  }
  if (props->traits.caretHidden != m_props->traits.caretHidden) {
    m_textInputNode.setCaretHidden(props->traits.caretHidden);
  }
  if (!m_props ||
      props->traits.returnKeyType != m_props->traits.returnKeyType ||
      props->traits.returnKeyLabel != m_props->traits.returnKeyLabel) {
    m_textInputNode.setEnterKeyType(
        props->traits.returnKeyType, props->traits.returnKeyLabel);
    m_textAreaNode.setEnterKeyType(
        props->traits.returnKeyType, props->traits.returnKeyLabel);
  }
  if (props->traits.clearButtonMode != m_props->traits.clearButtonMode) {
    if (m_focused) {
      if (props->traits.clearButtonMode ==
          facebook::react::TextInputAccessoryVisibilityMode::WhileEditing) {
        m_textInputNode.setCancelButtonMode(props->traits.clearButtonMode);
      } else if (
          props->traits.clearButtonMode ==
          facebook::react::TextInputAccessoryVisibilityMode::UnlessEditing) {
        m_textInputNode.setCancelButtonMode(
            facebook::react::TextInputAccessoryVisibilityMode::Never);
      }
    } else {
      if (props->traits.clearButtonMode ==
          facebook::react::TextInputAccessoryVisibilityMode::WhileEditing) {
        m_textInputNode.setCancelButtonMode(
            facebook::react::TextInputAccessoryVisibilityMode::Never);
      } else if (
          props->traits.clearButtonMode ==
          facebook::react::TextInputAccessoryVisibilityMode::UnlessEditing) {
        m_textInputNode.setCancelButtonMode(
            facebook::react::TextInputAccessoryVisibilityMode::Always);
      }
    }

    if (props->traits.clearButtonMode ==
            facebook::react::TextInputAccessoryVisibilityMode::Always ||
        props->traits.clearButtonMode ==
            facebook::react::TextInputAccessoryVisibilityMode::Never) {
      m_textInputNode.setCancelButtonMode(props->traits.clearButtonMode);
    }
  }

  if (!(props->yogaStyle == m_props->yogaStyle)) {
    m_textInputNode.setPadding(resolveEdges(
        [&props](auto edge) { return props->yogaStyle.padding(edge); }));
    m_textAreaNode.setPadding(resolveEdges(
        [&props](auto edge) { return props->yogaStyle.padding(edge); }));
  }

  if (!m_props) {
    m_textInputNode.setInputFilter(".*");
    m_textAreaNode.setInputFilter(".*");
  }
  if (!m_props ||
      props->traits.showSoftInputOnFocus !=
          m_props->traits.showSoftInputOnFocus) {
    m_textAreaNode.setShowKeyboardOnFocus(props->traits.showSoftInputOnFocus);
    m_textInputNode.setShowKeyboardOnFocus(props->traits.showSoftInputOnFocus);
  }
  if (!m_props ||
      props->importantForAutofill != m_props->importantForAutofill) {
    m_textAreaNode.setAutoFill(props->importantForAutofill);
    m_textInputNode.setAutoFill(props->importantForAutofill);
  }
  if (!m_props ||
      *(props->underlineColorAndroid) != *(m_props->underlineColorAndroid)) {
    m_textInputNode.setUnderlineColor(props->underlineColorAndroid);
    m_textAreaNode.setUnderlineColor(props->underlineColorAndroid);
  }

  if (props->traits.textContentType != m_props->traits.textContentType) {
    m_textInputNode.setTextContentType(props->traits.textContentType);
    m_textAreaNode.setTextContentType(props->traits.textContentType);
  }

  if (props->traits.submitBehavior != m_props->traits.submitBehavior) {
    m_textInputNode.setBlurOnSubmit(
        props->traits.submitBehavior ==
        facebook::react::SubmitBehavior::BlurAndSubmit);
    m_textAreaNode.setBlurOnSubmit(
        props->traits.submitBehavior ==
        facebook::react::SubmitBehavior::BlurAndSubmit);
  }

  if (!m_props || props->blurOnSubmit != m_props->blurOnSubmit) {
    m_textInputNode.setBlurOnSubmit(props->blurOnSubmit);
    m_textAreaNode.setBlurOnSubmit(props->blurOnSubmit);
  }

  if (!m_props || props->traits.editable != m_props->traits.editable) {
    m_textAreaNode.setEnabled(props->traits.editable);
    m_textInputNode.setEnabled(props->traits.editable);
  }
  if (!m_props ||
      props->traits.selectTextOnFocus != m_props->traits.selectTextOnFocus) {
    m_textInputNode.setSelectAll(props->traits.selectTextOnFocus);
    m_textAreaNode.setSelectAll(props->traits.selectTextOnFocus);
  }
}

void TextInputComponentInstance::onLayoutChanged(
    facebook::react::LayoutMetrics const& layoutMetrics) {
  CppComponentInstance::onLayoutChanged(layoutMetrics);
  m_textAreaNode.setLayoutRect(
      layoutMetrics.frame.origin,
      layoutMetrics.frame.size,
      layoutMetrics.pointScaleFactor);
  m_textInputNode.setLayoutRect(
      layoutMetrics.frame.origin,
      layoutMetrics.frame.size,
      layoutMetrics.pointScaleFactor);
}

int32_t TextInputComponentInstance::countUtf8Characters(
    std::string const& content) {
  /**
   * For TextInput component, when value is set and user tries to enter Chinese
   * characters, the caret would not be kept at the end of TextInput value. The
   * reason is that the under UTF-8 encoding, English and Chinese character
   * length is calculated differently using m_content.size(). English char has
   * length 1, while Chinese char has length 3, which would cause caret position
   * calculation error.
   */
  int32_t length = 0;

  // UTF-8 encoding constants in binary representation
  constexpr uint8_t ONE_BYTE_MASK = 0b10000000;
  constexpr uint8_t ONE_BYTE_FLAG = 0b00000000;
  constexpr uint8_t TWO_BYTE_MASK = 0b11100000;
  constexpr uint8_t TWO_BYTE_FLAG = 0b11000000;
  constexpr uint8_t THREE_BYTE_MASK = 0b11110000;
  constexpr uint8_t THREE_BYTE_FLAG = 0b11100000;
  constexpr uint8_t FOUR_BYTE_MASK = 0b11111000;
  constexpr uint8_t FOUR_BYTE_FLAG = 0b11110000;

  // Character byte length constants
  constexpr size_t SINGLE_BYTE_CHAR = 1;
  constexpr size_t DOUBLE_BYTE_CHAR = 2;
  constexpr size_t TRIPLE_BYTE_CHAR = 3;
  constexpr size_t QUAD_BYTE_CHAR = 4;

  for (size_t i = 0; i < content.size();) {
    const uint8_t leadByte = static_cast<uint8_t>(content[i]);
    size_t charBytes = SINGLE_BYTE_CHAR; // Default to 1 byte

    if ((leadByte & ONE_BYTE_MASK) == ONE_BYTE_FLAG) {
      charBytes = SINGLE_BYTE_CHAR;
    } else if ((leadByte & TWO_BYTE_MASK) == TWO_BYTE_FLAG) {
      charBytes = DOUBLE_BYTE_CHAR;
    } else if ((leadByte & THREE_BYTE_MASK) == THREE_BYTE_FLAG) {
      charBytes = TRIPLE_BYTE_CHAR;
    } else if ((leadByte & FOUR_BYTE_MASK) == FOUR_BYTE_FLAG) {
      charBytes = QUAD_BYTE_CHAR;
    } else {
      ++length;
      continue;
    }

    // Verify we have enough bytes remaining
    if (i + charBytes > content.size()) {
      charBytes = content.size() - i;
    }

    i += charBytes;
    ++length;
  }

  return length;
}

void TextInputComponentInstance::setTextContentAndSelection(
    std::string const& content,
    size_t selectionStart,
    size_t selectionEnd) {
  m_textInputNode.setTextContent(content);
  m_textAreaNode.setTextContent(content);
  m_textInputNode.setTextSelection(selectionStart, selectionEnd);
  m_textAreaNode.setTextSelection(selectionStart, selectionEnd);
  m_selectionStart = selectionStart;
  m_selectionEnd = selectionEnd;
  m_content = content;
}

void TextInputComponentInstance::setTextContent(std::string const& content) {
  // NOTE: if selection isn't set explicitly by JS side, we want it to stay
  // roughly in the same place, rather than have it move to the end of the
  // input (which is the ArkUI default behaviour)
  auto selectionFromEnd = countUtf8Characters(m_content) - m_selectionLocation;
  auto selectionStart = countUtf8Characters(content) - selectionFromEnd;
  auto selectionEnd = selectionStart + m_selectionLength;
  setTextContentAndSelection(content, selectionStart, selectionEnd);
}

void TextInputComponentInstance::onCommandReceived(
    std::string const& commandName,
    folly::dynamic const& args) {
  if (commandName == "focus") {
    focus();
    if (m_selectionStart.has_value() && m_selectionEnd.has_value() &&
        !m_props->traits.selectTextOnFocus) {
      m_textInputNode.setTextSelection(
          m_selectionStart.value(), m_selectionEnd.value());
      m_textAreaNode.setTextSelection(
          m_selectionStart.value(), m_selectionEnd.value());
    }
    if (m_isControlledTextInput) {
      m_caretPositionForControlledInput = m_selectionStart.value();
    }
  } else if (commandName == "blur") {
    if (m_multiline) {
      if (m_textAreaNode.isFocused()) {
        blur();
      }
    } else {
      if (m_textInputNode.isFocused()) {
        blur();
      }
    }
  } else if (
      commandName == "setTextAndSelection" && args.isArray() &&
      args.size() == 4 && args[0].asInt() >= m_nativeEventCount) {
    auto textContent = args[1].asString();
    auto selectionStart = args[2].asInt();
    auto selectionEnd = args[3].asInt();

    if (selectionStart < 0) {
      if (m_isControlledTextInput) {
        setTextContentAndSelection(
            textContent,
            m_caretPositionForControlledInput,
            m_caretPositionForControlledInput);
      } else {
        setTextContent(textContent);
      }
    } else {
      setTextContentAndSelection(textContent, selectionStart, selectionEnd);
    }
  }
}

void TextInputComponentInstance::onStateChanged(
    SharedConcreteState const& state) {
  CppComponentInstance::onStateChanged(state);

  if (state->getData().mostRecentEventCount < this->m_nativeEventCount) {
    return;
  }

  auto content = getTextContentFromState(state);

  setTextContent(content);
}

ArkUINode& TextInputComponentInstance::getLocalRootArkUINode() {
  if (m_multiline) {
    return m_textAreaNode;
  }
  return m_textInputNode;
}

void TextInputComponentInstance::focus() {
  getLocalRootArkUINode().setFocusStatus(1);
}

void TextInputComponentInstance::blur() {
  getLocalRootArkUINode().setFocusStatus(0);
}

void TextInputComponentInstance::onMessageReceived(
    const ArkTSMessage& message) {
  if (message.name == "KEYBOARD_VISIBLE" && this->m_focused) {
    auto parent = this->m_parent.lock();
    std::shared_ptr<ScrollViewComponentInstance> scrollView = nullptr;
    while (parent != nullptr) {
      scrollView =
          std::dynamic_pointer_cast<ScrollViewComponentInstance>(parent);
      if (scrollView != nullptr) {
        scrollView->setKeyboardAvoider(shared_from_this());
        break;
      }
      parent = parent->getParent().lock();
    }
  }
}

// KeyboardAvoider
facebook::react::Float
TextInputComponentInstance::getBottomEdgeOffsetRelativeToScrollView(
    std::shared_ptr<ScrollViewComponentInstance> scrollView) {
  auto relativePos = m_layoutMetrics.frame.origin;
  auto parent = m_parent.lock();
  while (parent != nullptr && parent->getTag() != scrollView->getTag()) {
    relativePos += parent->getLayoutMetrics().frame.origin;
    parent = parent->getParent().lock();
  }
  /**
   * It looks like 24 is used by the platform when KeyboardAvoider hack isn't
   * needed.
   */
  auto GAP_BETWEEN_KEYBOARD_AND_TEXT_INPUT = 24;
  return relativePos.y + m_layoutMetrics.frame.size.height +
      GAP_BETWEEN_KEYBOARD_AND_TEXT_INPUT;
}

} // namespace rnoh
