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
  DirectEventHandler,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

type RNSegmentedControlOnChangeEvent = Readonly<{
  selectedSegmentIndex: Int32;
}>;
interface RNSegmentedControl extends ViewProps {
  options: {
    buttons: { text: string }[];
    backgroundColor?: ProcessedColorValue;
    fontColor?: ProcessedColorValue;
    selectedBackgroundColor?: ProcessedColorValue;
    selectedFontColor?: ProcessedColorValue;
  };
  selectedIndexes: number[] | undefined;
  enabled: boolean;
  onChange?: DirectEventHandler<RNSegmentedControlOnChangeEvent>;
}

export default codegenNativeComponent<RNSegmentedControl>(
  'RNSegmentedControl'
) as HostComponent<RNSegmentedControl>;
