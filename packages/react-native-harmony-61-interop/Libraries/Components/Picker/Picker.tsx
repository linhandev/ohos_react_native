/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import {
  ColorValue,
  StyleProp,
  TextStyle,
  StyleSheet,
  processColor,
} from '@react-native-oh/react-native-harmony';

import PickerNativeComponent, {
  NativePickerItem,
} from '../../../src/private/specs/components/PickerNativeComponent';

/**
 * Default height:
 * - OHOS: 40
 * - Android: 50
 *
 * Android's default height is used on OHOS to avoid layout inconsistencies between platforms.
 * However, on OHOS 40 looks better because rounding creates half of a circle. To eliminate this
 * problem, the default background color was set to transparent,
 * which is the default color also used on Android.
 *
 */
const DEFAULT_HEIGHT = 50;
/**
 * Default radius:
 * - OHOS: 20
 * - Android: 0
 *
 * OHOS uses rounding for Buttons and Picker Items.
 */
const DEFAULT_RADIUS = 20;
const OHOS_NATIVE_BUTTON_COLOR = 'rgb(10,85,236)';
const RNOH_BUTTON_COLOR_WITH_OPACITY_25 = 'rgba(49,122,255,0.25)';

const MODE_DIALOG = 'dialog' as const;
const MODE_DROPDOWN = 'dropdown' as const;

type PickerItemProps = Readonly<{
  /**
   * Text to display for this item.
   */
  label: string;

  /**
   * The value to be passed to picker's `onValueChange` callback when
   * this item is selected. Can be a string or an integer.
   */
  value?: number | string;

  /**
   * Color of this item's text.
   */
  color?: ColorValue;

  /**
   * Used to locate the item in end-to-end tests.
   */
  testID?: string;
}>;

/**
 * Individual selectable item in a Picker.
 */
class PickerItem extends React.Component<PickerItemProps> {
  render() {
    // The items are not rendered directly
    throw null;
    return null;
  }
}

type PickerProps = Readonly<{
  children?: React.ReactNode | React.ReactNode[];
  style?: StyleProp<TextStyle>;

  /**
   * Value matching value of one of the items. Can be a string or an integer.
   */
  selectedValue?: number | string;

  /**
   * Callback for when an item is selected. This is called with the following parameters:
   *   - `itemValue`: the `value` prop of the item that was selected
   *   - `itemIndex`: the index of the selected item in this picker
   */
  onValueChange?: (itemValue: string | number, itemIndex: number) => void;

  /**
   * If set to false, the picker will be disabled, i.e. the user will not be able to make a
   * selection.
   */
  enabled?: boolean;

  /**
   * On Android, specifies how to display the selection items when the user taps on the picker:
   *
   *   - 'dialog': Show a modal dialog. This is the default.
   *   - 'dropdown': Shows a dropdown anchored to the picker view
   */
  mode?: 'dialog' | 'dropdown';

  /**
   * Style to apply to each of the item labels.
   */
  itemStyle?: StyleProp<TextStyle>;

  /**
   * Style to apply to each of the item labels. (OHOS only)
   */
  selectedItemStyle?: StyleProp<TextStyle>;

  /**
   * Prompt string for this picker, used on Android in dialog mode as the title of the dialog.
   */
  prompt?: string;

  /**
   * Used to locate this view in end-to-end tests.
   */
  testID?: string;
}>;

/**
 * Renders the native picker component on iOS and Android. Example:
 *
 *     <Picker
 *       selectedValue={this.state.language}
 *       onValueChange={(itemValue, itemIndex) => this.setState({language: itemValue})}>
 *       <Picker.Item label="Java" value="java" />
 *       <Picker.Item label="JavaScript" value="js" />
 *     </Picker>
 */
export default class Picker extends React.Component<PickerProps> {
  /**
   * On Android, display the options in a dialog.
   */
  static MODE_DIALOG = MODE_DIALOG;

  /**
   * On Android, display the options in a dropdown (this is the default).
   */
  static MODE_DROPDOWN = MODE_DROPDOWN;

  static Item: typeof PickerItem = PickerItem;

  static defaultProps = {
    mode: MODE_DIALOG,
  };

  private getPickerItemsAsProp(): NativePickerItem[] {
    return React.Children.toArray(this.props.children).flatMap((child) => {
      if (
        React.isValidElement(child) &&
        typeof child.type === 'function' &&
        child.type.name === PickerItem.name
      ) {
        const p = child.props as PickerItemProps;
        return [{ label: p.label, value: p.value } satisfies NativePickerItem];
      }
      return [];
    });
  }

  override render() {
    const {
      selectedValue,
      enabled,
      mode,
      prompt,
      onValueChange,
      style,
      itemStyle,
      selectedItemStyle,
    } = this.props;

    const flatStyle = StyleSheet.flatten(style);
    const flatItemStyle = StyleSheet.flatten(itemStyle);
    const flatSelectedItemStyle = StyleSheet.flatten(selectedItemStyle);

    return (
      <PickerNativeComponent
        style={StyleSheet.compose(
          { height: DEFAULT_HEIGHT, borderRadius: DEFAULT_RADIUS },
          style
        )}
        selectedValue={selectedValue}
        enabled={enabled}
        mode={mode}
        prompt={prompt}
        items={this.getPickerItemsAsProp()}
        onValueChange={(e) => {
          onValueChange?.(
            e.nativeEvent.itemValue as string | number,
            e.nativeEvent.itemIndex
          );
        }}
        fontColor={processColor(flatStyle?.color ?? 'black') ?? undefined}
        itemFontColor={
          processColor(flatItemStyle?.color ?? 'black') ?? undefined
        }
        itemBackgroundColor={
          processColor(
            flatItemStyle?.backgroundColor ?? 'rgba(255,255,255,0)'
          ) ?? undefined
        }
        selectedItemFontColor={
          processColor(
            /**
             * The Native Button Color provides a better contrast than RNOH_BUTTON_COLOR, because it's slightly darker.
             * The color inconsistency between RNOH_BUTTON_COLOR and Native Button Color isn't noticeable in this scenario.
             */
            flatSelectedItemStyle?.color ?? OHOS_NATIVE_BUTTON_COLOR
          ) ?? undefined
        }
        selectedItemBackgroundColor={
          processColor(
            flatSelectedItemStyle?.backgroundColor ??
              /**
               * Reusing RNOH Button color here for consistency between default colors used by RNOH components.
               */
              RNOH_BUTTON_COLOR_WITH_OPACITY_25
          ) ?? undefined
        }
      />
    );
  }
}
