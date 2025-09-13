/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {
  ViewProps,
  HostComponent,
  ProcessedColorValue,
} from 'react-native';
import type {
  WithDefault,
  DirectEventHandler,
  UnsafeMixed,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

type RNPickerOnChangeEvent = Readonly<{
  itemValue: UnsafeMixed;
  itemIndex: Int32;
}>;

export type NativePickerItem = {
  label: string;
  value?: UnsafeMixed;
  color?: ProcessedColorValue;
};

interface RNPickerProps extends ViewProps {
  selectedValue?: UnsafeMixed;
  onValueChange?: DirectEventHandler<RNPickerOnChangeEvent>;
  enabled?: WithDefault<boolean, true>;
  mode?: WithDefault<'dialog' | 'dropdown', 'dropdown'>;
  prompt?: string;
  items: NativePickerItem[];
  fontColor?: ProcessedColorValue;
  itemFontColor?: ProcessedColorValue;
  itemBackgroundColor?: ProcessedColorValue;
  selectedItemFontColor?: ProcessedColorValue;
  selectedItemBackgroundColor?: ProcessedColorValue;
}

export default codegenNativeComponent<RNPickerProps>(
  'RNPicker'
) as HostComponent<RNPickerProps>;
