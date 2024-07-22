import {View, Animated, StyleSheet} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {TestCaseProps} from './TestPerformer';

export default function Test1({onComplete}: TestCaseProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      onComplete();
    }, 2000);
  }, []);

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    );
    spinAnimation.start();

    return () => spinAnimation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.square,
          {
            transform: [{rotate: spin}],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  square: {
    width: 100,
    height: 100,
    backgroundColor: 'blue',
  },
});
