/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// RNOH patch: fix imports
import type {
  HostComponent,
  PartialViewConfig,
} from 'react-native/Libraries/Renderer/shims/ReactNativeTypes';

import * as NativeComponentRegistry from 'react-native/Libraries/NativeComponent/NativeComponentRegistry';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import Platform from 'react-native/Libraries/Utilities/Platform';
import {type ViewProps as Props} from 'react-native/Libraries/Components/View/ViewPropTypes';
import * as React from 'react';

// RNOH patch: export Android config
export const __INTERNAL_VIEW_CONFIG: PartialViewConfig =
   {
        uiViewClassName: 'RCTView',
        validAttributes: {
          // ReactClippingViewManager @ReactProps
          removeClippedSubviews: true,

          // ReactViewManager @ReactProps
          accessible: true,
          hasTVPreferredFocus: true,
          nextFocusDown: true,
          nextFocusForward: true,
          nextFocusLeft: true,
          nextFocusRight: true,
          nextFocusUp: true,

          borderRadius: true,
          borderTopLeftRadius: true,
          borderTopRightRadius: true,
          borderBottomRightRadius: true,
          borderBottomLeftRadius: true,
          borderTopStartRadius: true,
          borderTopEndRadius: true,
          borderBottomStartRadius: true,
          borderBottomEndRadius: true,
          borderEndEndRadius: true,
          borderEndStartRadius: true,
          borderStartEndRadius: true,
          borderStartStartRadius: true,
          borderStyle: true,
          hitSlop: true,
          pointerEvents: true,
          nativeBackgroundAndroid: true,
          nativeForegroundAndroid: true,
          needsOffscreenAlphaCompositing: true,

          borderWidth: true,
          borderLeftWidth: true,
          borderRightWidth: true,
          borderTopWidth: true,
          borderBottomWidth: true,
          borderStartWidth: true,
          borderEndWidth: true,

          borderColor: {
            process: require('react-native/Libraries/StyleSheet/processColor').default,
          },
          borderLeftColor: {
            process: require('react-native/Libraries/StyleSheet/processColor').default,
          },
          borderRightColor: {
            process: require('react-native/Libraries/StyleSheet/processColor').default,
          },
          borderTopColor: {
            process: require('react-native/Libraries/StyleSheet/processColor').default,
          },
          borderBottomColor: {
            process: require('react-native/Libraries/StyleSheet/processColor').default,
          },
          borderStartColor: {
            process: require('react-native/Libraries/StyleSheet/processColor').default,
          },
          borderEndColor: {
            process: require('react-native/Libraries/StyleSheet/processColor').default,
          },
          borderBlockColor: {
            process: require('react-native/Libraries/StyleSheet/processColor').default,
          },
          borderBlockEndColor: {
            process: require('react-native/Libraries/StyleSheet/processColor').default,
          },
          borderBlockStartColor: {
            process: require('react-native/Libraries/StyleSheet/processColor').default,
          },

          focusable: true,
          overflow: true,
          backfaceVisibility: true,
          experimental_layoutConformance: true,
        },
      };

const ViewNativeComponent: HostComponent<Props> =
  NativeComponentRegistry.get<Props>('RCTView', () => __INTERNAL_VIEW_CONFIG);

interface NativeCommands {
  +hotspotUpdate: (
    viewRef: React.ElementRef<HostComponent<mixed>>,
    x: number,
    y: number,
  ) => void;
  +setPressed: (
    viewRef: React.ElementRef<HostComponent<mixed>>,
    pressed: boolean,
  ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['hotspotUpdate', 'setPressed'],
});

export default ViewNativeComponent;

export type ViewNativeComponentType = HostComponent<Props>;
