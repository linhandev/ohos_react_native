/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import StyleSheet from '@react-native-oh/react-native-harmony/Libraries/StyleSheet/StyleSheet';
import {
  processColor,
  type StyleSheet as StyleSheetType,
} from '@react-native-oh/react-native-harmony';
// import type {OnChangeEvent} from '../../../src/private/specs/components/SegmentedControlNativeComponent';
import type { ViewProps } from '@react-native-oh/react-native-harmony/Libraries/components/View/ViewPropTypes';
import RCTSegmentedControlNativeComponent from '../../../src/private/specs/components/SegmentedControlNativeComponent';
import type { NativeSyntheticEvent } from '@react-native-oh/react-native-harmony/Libraries/Types/CoreEventTypes';

type OnChangeEvent = any;

type SegmentedControlIOSProps = ViewProps &
  Readonly<{
    values: ReadonlyArray<string>;
    selectedIndex?: number | undefined;
    enabled?: boolean;
    tintColor?: string | undefined;
    momentary?: boolean | undefined;
    onChange?:
      | ((event: NativeSyntheticEvent<OnChangeEvent>) => void)
      | undefined;
    onValueChange?: (value: string) => any;
  }>;

const SegmentedControlIOSWithRef = React.forwardRef(
  (
    props: SegmentedControlIOSProps,
    forwardedRef: React.Ref<typeof RCTSegmentedControlNativeComponent>
  ) => {
    const {
      values,
      selectedIndex,
      enabled,
      onChange,
      onValueChange,
      style,
      ...otherProps
    } = props;
    return (
      <RCTSegmentedControlNativeComponent
        {...otherProps}
        style={[styles.segmentedControl, style]}
        options={{
          buttons: values.map((value) => ({ text: value })),
          selectedBackgroundColor:
            props.tintColor !== undefined
              ? processColor(props.tintColor) ?? undefined
              : undefined,
        }}
        selectedIndexes={
          selectedIndex === undefined ? undefined : [selectedIndex]
        }
        enabled={enabled ?? true}
        ref={forwardedRef as any}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(values[e.nativeEvent.selectedSegmentIndex]);
        }}
      />
    );
  }
);

const styles = (StyleSheet as any as typeof StyleSheetType).create({
  segmentedControl: {
    height: 28,
  },
});

module.exports = SegmentedControlIOSWithRef;
