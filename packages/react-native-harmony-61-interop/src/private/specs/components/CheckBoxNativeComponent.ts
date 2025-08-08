/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps, HostComponent, ProcessedColorValue } from 'react-native';
import type {
  WithDefault,
  DirectEventHandler,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

type RNCheckBoxOnChangeEvent = Readonly<{
  target: Int32;
  value: boolean;
}>;
interface RNCheckBoxProps extends ViewProps {
  value?: WithDefault<boolean, false>;
  disabled?: WithDefault<boolean, false>;
  onValueChange?: DirectEventHandler<RNCheckBoxOnChangeEvent>;
  checkedColor?: ProcessedColorValue;
  uncheckedColor?: ProcessedColorValue;
  markSize?: WithDefault<Int32, -1>;
  strokeColor?: ProcessedColorValue;
  boxType?: WithDefault<'circle' | 'square', 'square'>;
  lineWidth?: WithDefault<Int32, -1>;
}

export default codegenNativeComponent<RNCheckBoxProps>(
  'RNCheckBox'
) as HostComponent<RNCheckBoxProps>;
