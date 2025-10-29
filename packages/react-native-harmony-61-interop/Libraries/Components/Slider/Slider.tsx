/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  ViewProps,
  ViewStyle,
  ColorValue,
  NativeSyntheticEvent,
  StyleProp,
  processColor,
} from 'react-native';
import RCTSliderNativeComponent from '../../../src/private/specs/components/RNSliderNativeComponent';
//@ts-ignore
import type { ImageSource } from 'react-native/Libraries/Image/ImageSource';

import type { Ref } from 'react';

const LIMIT_MIN_VALUE = Number.MIN_SAFE_INTEGER;
const LIMIT_MAX_VALUE = Number.MAX_SAFE_INTEGER;

type Event = NativeSyntheticEvent<
  Readonly<{
    value: number;
    /**
     * Android Only.
     */
    fromUser?: boolean;
  }>
>;

type Props = ViewProps &
  Readonly<{
    /**
     * Used to style and layout the `Slider`.  See `StyleSheet.js` and
     * `DeprecatedViewStylePropTypes.js` for more info.
     */
    style?: StyleProp<ViewStyle>;

    /**
     * Write-only property representing the value of the slider.
     * Can be used to programmatically control the position of the thumb.
     * Entered once at the beginning still acts as an initial value.
     * The value should be between minimumValue and maximumValue,
     * which default to 0 and 1 respectively.
     * Default value is 0.
     *
     * This is not a controlled component, you don't need to update the
     * value during dragging.
     */
    value?: number;

    /**
     * Step value of the slider. The value should be
     * between 0 and (maximumValue - minimumValue).
     * Default value is 0.
     */
    step?: number;

    /**
     * Initial minimum value of the slider. Default value is 0.
     */
    minimumValue?: number;

    /**
     * Initial maximum value of the slider. Default value is 1.
     */
    maximumValue?: number;

    /**
     * The color used for the track to the left of the button.
     * Overrides the default blue gradient image on iOS.
     */
    minimumTrackTintColor?: ColorValue;

    /**
     * The color used for the track to the right of the button.
     * Overrides the default blue gradient image on iOS.
     */
    maximumTrackTintColor?: ColorValue;
    /**
     * The color used to tint the default thumb images on iOS, or the
     * color of the foreground switch grip on Android.
     */
    thumbTintColor?: ColorValue;

    /**
     * If true the user won't be able to move the slider.
     * Default value is false.
     */
    disabled?: boolean;

    /**
     * Callback continuously called while the user is dragging the slider.
     */
    onValueChange?: (value: number) => void;

    /**
     * Callback that is called when the user releases the slider,
     * regardless if the value has changed. The current value is passed
     * as an argument to the callback handler.
     */
    onSlidingComplete?: (value: number) => void;

    /**
     * Used to locate this view in UI automation tests.
     */
    testID?: string;

    /**
     * Sets an image for the thumb. Only static images are supported.
     */
    thumbImage?: ImageSource;

    /**
     * If true the slider will be inverted.
     * Default value is false.
     */
    inverted?: boolean;
  }>;

const SliderComponent = (
  props: Props,
  forwardedRef?: Ref<typeof RCTSliderNativeComponent>,
) => {
  const style = StyleSheet.compose(props.style, styles.slider);

  const {
    onValueChange,
    onSlidingComplete,
    minimumTrackTintColor,
    maximumTrackTintColor,
    thumbTintColor,
    ...localProps
  } = props;

  const onValueChangeEvent = onValueChange
    ? (event: Event) => {
      onValueChange(event.nativeEvent.value);
    }
    : null;

  const onSlidingCompleteEvent = onSlidingComplete
    ? (event: Event) => {
      onSlidingComplete(event.nativeEvent.value);
    }
    : null;

  const value =
    Number.isNaN(props.value) || !props.value ? undefined : props.value;

  const processedColors = {
    minimumTrackTintColor: processColor(minimumTrackTintColor),
    maximumTrackTintColor: processColor(maximumTrackTintColor),
    thumbTintColor: processColor(thumbTintColor),
  }

  return (
    <RCTSliderNativeComponent
      {...localProps}
      {...processedColors}
      value={value}
      thumbImage={
        Platform.OS === 'web'
          ? props.thumbImage
          : props.thumbImage
            ? Image.resolveAssetSource(props.thumbImage)
            : undefined
      }
      ref={forwardedRef}
      style={style}
      onChange={onValueChangeEvent}
      onRNSliderSlidingComplete={onSlidingCompleteEvent}
      onRNSliderValueChange={onValueChangeEvent}
      disabled={!!props.disabled}
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
    />
  );
};

const SliderWithRef = React.forwardRef(SliderComponent);

SliderWithRef.defaultProps = {
  value: 0,
  minimumValue: 0,
  maximumValue: 1,
  step: 0.01,
  inverted: false,
};

let styles = StyleSheet.create({
  slider: {
    height: 40
  },
});

export default SliderWithRef;
