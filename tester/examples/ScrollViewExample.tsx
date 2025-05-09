/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE-MIT file in the root directory of this source tree.
 */

import React, {useRef} from 'react';
import {
  Animated,
  View,
  ScrollView,
  Alert,
  StyleSheet,
  PanResponder,
  Text,
} from 'react-native';

const handleClick = () => {
  Alert.alert('Handle Click Event');
};

export const GesturesInScrollViewExample = () => {
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.extractOffset();
      },
    }),
  ).current;

  return (
    <ScrollView
      horizontal={true}
      overScrollMode={'never'}
      style={{
        backgroundColor: 'green'
      }}>
      <View style={{width: 250, height: 200, backgroundColor: 'pink', marginRight: 5}}>
        <Text style={{textAlign: 'center'}} onPress={handleClick}>
          Clicking will trigger a pop-up, while horizontal swiping will not.
        </Text>
        <Animated.View
          style={{
            transform: [{translateX: pan.x}, {translateY: pan.y}],
          }}
          {...panResponder.panHandlers}>
          <View style={styles.box} >
            <Text style={styles.boxText}>You can drag me</Text>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  box: {
    height: 150,
    width: 150,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  boxText: {
    textAlign: 'center',
    color: 'white',
    marginTop: 60,
    fontSize: 16,
  },
});

