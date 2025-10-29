/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { HostComponent, ProcessedColorValue, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
//@ts-ignore
import type { ImageSource } from 'react-native/Libraries/Image/ImageSource';
import type {
  BubblingEventHandler,
  DirectEventHandler,
  Float,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

type Event = Readonly<{
  value: Float;
  fromUser?: boolean;
}>;

export interface NativeProps extends ViewProps {
  disabled?: WithDefault<boolean, false>;
  inverted?: WithDefault<boolean, false>;
  vertical?: WithDefault<boolean, false>;
  maximumTrackTintColor?: ProcessedColorValue;
  maximumValue?: Float;
  minimumTrackTintColor?: ProcessedColorValue;
  minimumValue?: Float;
  onRNSliderChange?: BubblingEventHandler<Event>;
  onRNSliderSlidingComplete?: DirectEventHandler<Event>;
  onRNSliderValueChange?: BubblingEventHandler<Event>;
  step?: Float;
  testID?: string;
  thumbImage?: ImageSource;
  thumbTintColor?: ProcessedColorValue;
  value?: Float;
}

export default codegenNativeComponent<NativeProps>(
  'RNSlider',
) as HostComponent<NativeProps>;
