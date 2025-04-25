/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  BaseTextInputDelegate,
  GetNativeTextContentTypeOptions,
} from '@react-native-oh/react-native-core/Libraries/Components/TextInput/delegates/BaseTextInputDelegate';

const RCTSinglelineTextInputView =
  require('@react-native-oh/react-native-core/Libraries/Components/TextInput/RCTSingelineTextInputNativeComponent').default;
const RCTMultilineTextInputView =
  require('@react-native-oh/react-native-core/Libraries/Components/TextInput/RCTMultilineTextInputNativeComponent').default;
const RCTSinglelineTextInputNativeCommands =
  require('@react-native-oh/react-native-core/Libraries/Components/TextInput/RCTSingelineTextInputNativeComponent').Commands;
const RCTMultilineTextInputNativeCommands =
  require('@react-native-oh/react-native-core/Libraries/Components/TextInput/RCTMultilineTextInputNativeComponent').Commands;

export default class TextInputDelegate extends BaseTextInputDelegate {
  override createNativeTextInput(props: any): React.ReactNode {
    const RCTTextInputView =
      props.multiline === true
        ? RCTMultilineTextInputView
        : RCTSinglelineTextInputView;

    return <RCTTextInputView {...props} />;
  }

  private keyboardTypeByInputMode = new Map<string, string>()
    .set('none', 'default')
    .set('text', 'default')
    .set('decimal', 'decimal-pad')
    .set('numeric', 'number-pad')
    .set('tel', 'phone-pad')
    .set('search', 'web-search')
    .set('email', 'email-address')
    .set('url', 'url');

  override getKeyboardTypeByInputMode(inputMode: string): string {
    return this.keyboardTypeByInputMode.get(inputMode) ?? 'default';
  }

  override getSupportedKeyboardTypes(): string[] {
    return [
      'default',
      'email-address',
      'numeric',
      'phone-pad',
      'number-pad',
      'url',
      'decimal-pad',
      'ascii-capable',
      'numbers-and-punctuation',
      'name-phone-pad',
      'twitter',
      'web-search',
      'ascii-capable-number-pad',
      'visible-password',
    ];
  }

  override getNativeAutocomplete(
    autocomplete: string | null | undefined
  ): string | null | undefined {
    return undefined;
  }

  override getNativeTextContentType(
    textContentType: string | null | undefined,
    {
      autocomplete,
      autocompleteWebToTextContentTypeMap,
    }: GetNativeTextContentTypeOptions
  ): string | null | undefined {
    return textContentType != null
      ? textContentType
      : autocomplete && autocomplete in autocompleteWebToTextContentTypeMap
      ? autocompleteWebToTextContentTypeMap[autocomplete]
      : textContentType;
  }

  override shouldBeCancellable(
    rejectResponderTermination: boolean
  ): boolean | null {
    return !rejectResponderTermination;
  }
  
  override getTextInputCommands(multiline: boolean): any {
    if (multiline) {
      return RCTMultilineTextInputNativeCommands;
    } else {
      return RCTSinglelineTextInputNativeCommands;
    }
  }
}
