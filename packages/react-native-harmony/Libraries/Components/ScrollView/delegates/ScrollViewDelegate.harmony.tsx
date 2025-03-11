/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import StyleSheet from '@react-native-oh/react-native-core/Libraries/StyleSheet/StyleSheet';
import {
  BaseScrollViewDelegate,
  RenderScrollViewWithRefreshControlArgs,
} from '@react-native-oh/react-native-core/Libraries/Components/ScrollView/delegates/BaseScrollViewDelegate';
// @ts-ignore
import flattenStyle from '@react-native-oh/react-native-core/Libraries/StyleSheet/flattenStyle';
// @ts-ignore
import splitLayoutProps from '@react-native-oh/react-native-core/Libraries/StyleSheet/splitLayoutProps';

export default class ScrollViewDelegate extends BaseScrollViewDelegate {
  override renderScrollViewWithRefreshControl({
    NativeScrollView,
    contentContainer,
    props,
    refreshControl,
    scrollViewRef,
    baseStyle,
  }: RenderScrollViewWithRefreshControlArgs): React.ReactNode {
    const { outer, inner } = splitLayoutProps(flattenStyle(props.style));
    return React.cloneElement(
      refreshControl,
      { style: (StyleSheet as any).compose(baseStyle, outer) },
      <NativeScrollView
        {...props}
        style={(StyleSheet as any).compose(baseStyle, inner)}
        ref={scrollViewRef}
      >
        {contentContainer}
      </NativeScrollView>
    );
  }
}
