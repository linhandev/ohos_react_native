/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {createViewConfig} from 'react-native/Libraries/NativeComponent/ViewConfig';
import UIManager from 'react-native/Libraries/ReactNative/UIManager';
import createReactNativeComponentClass from 'react-native/Libraries/Renderer/shims/createReactNativeComponentClass';
import {type HostComponent} from 'react-native/Libraries/Renderer/shims/ReactNativeTypes';
import {type ProcessedColorValue} from 'react-native/Libraries/StyleSheet/processColor';
import {type PressEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import {type TextProps} from 'react-native/Libraries/Text/TextProps';

type NativeTextProps = $ReadOnly<{
  ...TextProps,
  isHighlighted?: ?boolean,
  selectionColor?: ?ProcessedColorValue,
  onClick?: ?(event: PressEvent) => mixed,
  // This is only needed for platforms that optimize text hit testing, e.g.,
  // react-native-windows. It can be used to only hit test virtual text spans
  // that have pressable events attached to them.
  isPressable?: ?boolean,
}>;

const textViewConfig = {
  validAttributes: {
    // RNOH: patch - updated imports
    accessible: true,
    isHighlighted: true,
    isPressable: true,
    numberOfLines: true,
    ellipsizeMode: true,
    allowFontScaling: true,
    dynamicTypeRamp: true,
    maxFontSizeMultiplier: true,
    disabled: true,
    selectable: true,
    selectionColor: true,
    adjustsFontSizeToFit: true,
    minimumFontScale: true,
    textBreakStrategy: true,
    onTextLayout: true,
    onInlineViewLayout: true,
    dataDetectorType: true,
    android_hyphenationFrequency: true,
    lineBreakStrategyIOS: true,
  },
  directEventTypes: {
    topTextLayout: {
      registrationName: 'onTextLayout',
    },
    topInlineViewLayout: {
      registrationName: 'onInlineViewLayout',
    },
  },
  uiViewClassName: 'RCTText',
};

const virtualTextViewConfig = {
  validAttributes: {
    isHighlighted: true,
    isPressable: true,
    maxFontSizeMultiplier: true,
  },
  uiViewClassName: 'RCTVirtualText',
};

export const NativeText: HostComponent<NativeTextProps> =
  (createReactNativeComponentClass('RCTText', () =>
    createViewConfig(textViewConfig),
  ): any);

export const NativeVirtualText: HostComponent<NativeTextProps> =
  !global.RN$Bridgeless && !UIManager.hasViewManagerConfig('RCTVirtualText')
    ? NativeText
    : (createReactNativeComponentClass('RCTVirtualText', () =>
        createViewConfig(virtualTextViewConfig),
      ): any);
