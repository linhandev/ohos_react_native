/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * This is a controlled component version of RNCPickerHarmony
 * @format
 */
/**
 * NOTICE: This file is copied from @react-native-oh-tpl/picker and adapted.
 *
 * PickerIOS was initially part of the RN hence such copyright header is used.
 * This component was later extracted and moved to a separate library.
 * The copyright header above is also used in the react-native-community version, but the community version is converted to TypeScript.
 * @react-native-oh-tpl/picker is based on from react-native-community and slightly adapted for OHOS.
 */

"use strict";

import * as React from "react";
import type {
  ColorValue,
  NativeSyntheticEvent,
  TextStyle,
  ViewProps,
} from "react-native";
import { processColor, StyleSheet, View } from "react-native";
import PickerIOSNativeComponent, {
  NativePickerItem,
} from "../../../src/private/specs/components/PickerIOSNativeComponent";

type PickerHarmonyChangeEvent = NativeSyntheticEvent<{
  newValue: number | string;
  newIndex: number;
}>;

type Label = string | number;

interface Props extends ViewProps {
  children: React.ReactNode;
  itemStyle?: TextStyle;
  numberOfLines?: number;
  onChange?: (event: PickerHarmonyChangeEvent) => void;
  onValueChange?: (itemValue: string | number, itemIndex: number) => void;
  selectedValue?: number | string;
  selectionColor?: string;
  themeVariant?: string;
}

type ItemProps = Readonly<{
  label?: Label;
  value?: number | string;
  color?: ColorValue;
  testID?: string;
}>;

type CallbackRef<T> = (value: T) => void;
type ObjectRef<T> = { current: T };
type Ref<T> = CallbackRef<T> | ObjectRef<T>;

/**
 * Constructs a new ref that forwards new values to each of the given refs. The
 * given refs will always be invoked in the order that they are supplied.
 *
 * WARNING: A known problem of merging refs using this approach is that if any
 * of the given refs change, the returned callback ref will also be changed. If
 * the returned callback ref is supplied as a `ref` to a React element, this may
 * lead to problems with the given refs being invoked more times than desired.
 */
function useMergeRefs<T>(...refs: Array<Ref<T> | null>): CallbackRef<T> {
  return React.useCallback((current: T) => {
    for (const ref of refs) {
      if (ref == null) continue;
      if (typeof ref === "function") {
        ref(current);
      } else if (typeof (ref as any) === "object") {
        (ref as any).current = current;
      }
    }
  }, refs as any);
}

const PickerHarmonyItem: React.FC<ItemProps> = (_props: ItemProps) => null;

const PickerHarmonyWithForwardedRef = React.forwardRef<
  React.ElementRef<typeof PickerIOSNativeComponent>,
  Props
>(function PickerHarmony(props, forwardedRef): React.ReactElement {
  const {
    children,
    selectedValue,
    selectionColor,
    themeVariant,
    testID,
    itemStyle,
    numberOfLines,
    onChange,
    onValueChange,
    style,
  } = props;
  const nativePickerRef =
    React.useRef<React.ElementRef<typeof PickerIOSNativeComponent>>(null);

  const ref = useMergeRefs(nativePickerRef, forwardedRef);

  const [nativeSelectedIndex, setNativeSelectedIndex] = React.useState<{
    value: number | null;
  }>({
    value: null,
  });

  const [items, selectedIndex] = React.useMemo((): [
    NativePickerItem[],
    number,
  ] => {
    let selectedIndex = 0;
    const items = React.Children.toArray(children).map((child: any, index) => {
      if (String(child.props.value) === String(selectedValue)) {
        selectedIndex = index;
      }
      return {
        value: String(child.props.value),
        label: String(child.props.label),
        textColor: child.props.color,
        testID: child.props.testID,
      };
    });
    return [items, selectedIndex];
  }, [children, selectedValue]);

  let parsedNumberOfLines = Math.round(numberOfLines ?? 1);
  if (parsedNumberOfLines < 1) {
    parsedNumberOfLines = 1;
  }

  React.useLayoutEffect(() => {
    let jsValue = 0;
    React.Children.toArray(children).forEach(function (
      child: any,
      index: number
    ) {
      if (String(child.props.value) === String(selectedValue)) {
        jsValue = index;
      }
    });

    nativePickerRef.current?.setNativeProps({
      selectedIndex: jsValue,
    });
  }, [selectedValue, nativeSelectedIndex, children]);

  const _onChange = React.useCallback(
    (event: PickerHarmonyChangeEvent) => {
      onChange?.(event);
      onValueChange?.(event.nativeEvent.newValue, event.nativeEvent.newIndex);
      setNativeSelectedIndex({ value: event.nativeEvent.newIndex });
    },
    [onChange, onValueChange]
  );

  return (
    <View style={style}>
      <PickerIOSNativeComponent
        ref={ref}
        themeVariant={themeVariant}
        testID={testID}
        color={processColor(itemStyle?.color) ?? undefined}
        textAlign={itemStyle?.textAlign}
        fontSize={itemStyle?.fontSize}
        fontWeight={itemStyle?.fontWeight as string}
        fontStyle={itemStyle?.fontStyle}
        fontFamily={itemStyle?.fontFamily}
        style={[styles.pickerHarmony, itemStyle]}
        items={items}
        onChange={_onChange}
        numberOfLines={parsedNumberOfLines}
        selectedIndex={selectedIndex}
        selectionColor={
          processColor(selectionColor ?? itemStyle?.color) ?? undefined
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  pickerHarmony: {
    // The picker will conform to whatever width is given, but we do
    // have to set the component's height explicitly on the
    // surrounding view to ensure it gets rendered.
    height: 216,
  },
});

(PickerHarmonyWithForwardedRef as any).Item = PickerHarmonyItem;

export default PickerHarmonyWithForwardedRef;
