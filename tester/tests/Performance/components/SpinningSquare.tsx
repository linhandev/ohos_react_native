import {Animated, StyleSheet} from 'react-native';
import React, {useEffect, useRef} from 'react';

export default function SpinningSquare({
  onStart,
  children,
  startValue = 0,
  style = {},
  animationDuration = 2000,
  useNativeDriver = true,
}: any) {
  const spinValue = useRef(new Animated.Value(startValue)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1 - startValue,
        duration: animationDuration,
        useNativeDriver,
      }),
    );

    spinAnimation.start();
    onStart?.();

    return () => spinAnimation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.square,
        style,
        {
          transform: [{rotate: spin}],
        },
      ]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  square: {
    width: 10,
    height: 10,
    backgroundColor: 'blue',
  },
});
