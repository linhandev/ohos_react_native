/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <react/renderer/attributedstring/ParagraphAttributes.h>
#include <react/renderer/attributedstring/TextAttributes.h>
#include <react/renderer/components/textinput/conversions.h>
#include <react/renderer/components/textinput/primitives.h>
#include <react/renderer/components/text/BaseTextProps.h>
#include <react/renderer/components/view/ViewProps.h>
#include <react/renderer/core/Props.h>
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/propsConversions.h>
#include <react/renderer/graphics/Color.h>
#include <react/renderer/imagemanager/primitives.h>
#include <vector>

namespace facebook {
namespace react {

class TextInputProps final : public ViewProps, public BaseTextProps {
 public:
  TextInputProps() = default;
  TextInputProps(
      const PropsParserContext &context,
      TextInputProps const &sourceProps,
      RawProps const &rawProps);

  void setProp(
      const PropsParserContext &context,
      RawPropsPropNameHash hash,
      const char *propName,
      RawValue const &value);

#pragma mark - Props

  TextInputTraits const traits{};
  ParagraphAttributes const paragraphAttributes{};

  std::string const defaultValue{};

  std::string const placeholder{};
  SharedColor const placeholderTextColor{};

  int maxLength{};

  /*
   * Tint colors
   */
  SharedColor const cursorColor{};
  SharedColor const selectionColor{};
  // TODO: Rename to `tintColor` and make universal.
  SharedColor const underlineColorAndroid{};
  bool blurOnSubmit{}; // RNOH patch
  std::string const importantForAutofill{}; //RNOH patch

  /*
   * "Private" (only used by TextInput.js) props
   */
  std::string const text{};
  int const mostRecentEventCount{0};

  bool autoFocus{false};
  std::optional<Selection> selection{};

  std::string const inputAccessoryViewID{};

  bool onKeyPressSync{false};
  bool onChangeSync{false};

  /*
   * Accessors
   */
  TextAttributes getEffectiveTextAttributes(Float fontSizeMultiplier) const;
  ParagraphAttributes getEffectiveParagraphAttributes() const;
  TextAttributes defaultTextAttributes() const;
};

} // namespace react
} // namespace facebook
