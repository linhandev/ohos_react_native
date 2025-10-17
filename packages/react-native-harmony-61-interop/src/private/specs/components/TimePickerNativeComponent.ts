/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// Forked from https://github.com/react-native-oh-library/datetimepicker/tree/sig

import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {HostComponent} from 'react-native';

import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes';

import type {
  DirectEventHandler,
  Double,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

type DateTimePickerEvent = Readonly<{
  timestamp: Double;
}>;

export interface DatePickerIOSNativeProps extends ViewProps {
  date?: Double;
  locale?: string;
  maximumDate?: Double;
  minimumDate?: Double;
  minuteInterval?: WithDefault<
    1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30,
    1
  >;
  onChange?: DirectEventHandler<DateTimePickerEvent>;
  timeZoneOffsetInMinutes?: Double;
  enabled?: WithDefault<boolean, true>;
}

export default codegenNativeComponent<DatePickerIOSNativeProps>(
  'RNTimePickerNative',
) as HostComponent<DatePickerIOSNativeProps>;
