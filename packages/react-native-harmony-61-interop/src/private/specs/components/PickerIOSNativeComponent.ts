/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */
"use strict";

import type {
  HostComponent,
  ProcessedColorValue,
  ViewProps
} from "react-native";
import type {
  DirectEventHandler,
  Int32,
} from "react-native/Libraries/Types/CodegenTypes";

import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";

type RNPickerIOSonChangeEvent = Readonly<{
  newValue: string;
  newIndex: Int32;
}>;

export type NativePickerItem = Readonly<{
  label?: string;
  value?: string;
  textColor?: ProcessedColorValue;
  testID?: string;
}>;

export interface RNPickerIOSProps extends ViewProps {
  items: ReadonlyArray<NativePickerItem>;
  selectedIndex: Int32;
  selectionColor?: ProcessedColorValue;
  onChange: DirectEventHandler<RNPickerIOSonChangeEvent>;
  color?: ProcessedColorValue;
  textAlign?: string;
  numberOfLines?: Int32;
  fontSize?: Int32;
  fontWeight?: string;
  fontStyle?: string;
  fontFamily?: string;
  testID?: string;
  themeVariant?: string;
}

export default codegenNativeComponent<RNPickerIOSProps>(
  "RNPickerIOS"
) as HostComponent<RNPickerIOSProps>;
