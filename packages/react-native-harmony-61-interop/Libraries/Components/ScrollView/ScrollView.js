/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import RNOHScrollView from '@react-native-oh/react-native-harmony/Libraries/Components/ScrollView/ScrollView';

/**
 * Wrapps RNOHScrollView to add scrollWithoutAnimationTo method
 */
const ScrollView = forwardRef((props, ref) => {
  const scrollViewRef = useRef(null);

  useImperativeHandle(ref, () => ({
    scrollWithoutAnimationTo: (y, x) => {
      scrollViewRef.current?.scrollTo({ x, y, animated: false });
    },
    ...scrollViewRef.current
  }));

  return <RNOHScrollView ref={scrollViewRef} {...props} />;
});

ScrollView.displayName = 'ScrollView';
ScrollView.Context = RNOHScrollView.Context;

module.exports = ScrollView;
module.exports.default = ScrollView;