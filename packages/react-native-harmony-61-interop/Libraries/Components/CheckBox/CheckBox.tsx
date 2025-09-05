/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
/**
 * NOTICE: This file is copied from @react-native-oh-tpl/checkbox and adapted.
 *
 * CheckBox was initially part of the RN hence such copyright header is used.
 * This component was later extracted and moved to a separate library.
 * The copyright header above is also used in the react-native-community version, but the community version is converted to TypeScript.
 * @react-native-oh-tpl/checkbox is based on from react-native-community and slightly adapted for OHOS.
 */

//@ts-check
import nullthrows from 'nullthrows';
import React from 'react';
import {
  View,
  StyleSheet,
  processColor,
  ViewProps,
  NativeMethods,
  NativeSyntheticEvent,
} from 'react-native';
// @ts-ignore
import setAndForwardRef from '../../Utilities/setAndForwardRef';
import CheckBoxNativeComponent from '../../../src/private/specs/components/CheckBoxNativeComponent';

type CheckBoxEvent = NativeSyntheticEvent<
  Readonly<{
    target: number;
    value: boolean;
  }>
>;

type CommonProps = Readonly<
  ViewProps & {
    /**
     * Used in case the props change removes the component.
     */
    onChange?: (event: CheckBoxEvent) => void;

    /**
     * Invoked with the new value when the value changes.
     */
    onValueChange?: (value: boolean) => void;

    /**
     * If true the user won't be able to toggle the checkbox.
     * Default value is false.
     */
    disabled?: boolean;
  }
>;

type CheckBoxNativeType = NativeMethods;

type Props = Readonly<
  CommonProps & {
    /**
     * The value of the checkbox.  If true the checkbox will be turned on.
     * Default value is false.
     */
    value?: boolean;

    /**
     * Used to get the ref for the native checkbox
     */
    forwardedRef?: React.Ref<CheckBoxNativeType>;

    /**
     * Controls the colors the checkbox has in checked and unchecked states.
     */
    tintColors?: { true?: any; false?: any };

    // BEGIN: @react-native-community/checkbox props
    /**
     * @deprecated: Use lineWidth instead
     */
    // strokeWidth?: number;
    // markSize?: number;
    // lineWidth?: number;

    // strokeColor: string;
    // onCheckColor: string;
    // tintColor: string;
    // END: @react-native-community/checkbox props
  }
>;

class CheckBox extends React.Component<Props> {
  _nativeRef: React.Ref<CheckBoxNativeType> | null = null;
  _setNativeRef = setAndForwardRef({
    getForwardedRef: () => this.props.forwardedRef,
    setLocalRef: (ref: any) => {
      this._nativeRef = ref;
    },
  });

  _onChange = (event: CheckBoxEvent) => {
    const value = this.props.value || false;

    // @ts-ignore
    nullthrows(this._nativeRef).setNativeProps({ value: value });

    // Change the props after the native props are set in case the props
    // change removes the component
    this.props.onChange && this.props.onChange(event);
    this.props.onValueChange &&
      this.props.onValueChange(event.nativeEvent.value);
  };

  render() {
    const { tintColors, style, ...props } = this.props;
    const disabled = this.props.disabled || false;
    const value = this.props.value || false;

    const nativeProps = {
      ...props,
      onStartShouldSetResponder: () => true,
      onResponderTerminationRequest: () => false,
      enabled: !disabled,
      on: value,
      /**
       * - #317aff to be consistent with default button. It's not exactly the color used by the platform by default, but so is the case with button.
       * The color used by button can't be changed because of strict breaking changes policy.
       */
      checkedColor: tintColors?.true !== undefined
        ? processColor(tintColors.true)
        : processColor('#317aff'),
      /**
       * #666666 — color used by Android
       */
      uncheckedColor: tintColors?.false !== undefined
        ? processColor(tintColors.false)
        : processColor('#666666'),
      style: [styles.rctCheckBox, style],
      boxType: 'square',
      strokeColor: processColor('#ffffff')!,
    };
    return (
      <View style={styles.container}>
        <CheckBoxNativeComponent
          {...nativeProps}
          ref={this._setNativeRef}
          onValueChange={this._onChange}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 7,
  },
  rctCheckBox: {
    height: 18,
    width: 18,
  },
});

/**
 * Can't use CheckBoxNativeType because it has different props
 */
type CheckBoxType = NativeMethods;

const CheckBoxWithRef = React.forwardRef(function CheckBoxWithRef(
  props: Props,
  ref: React.Ref<CheckBoxType>
) {
  return <CheckBox {...props} forwardedRef={ref} />;
});

export default CheckBoxWithRef;
