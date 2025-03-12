import {View, StyleSheet} from 'react-native';
import React, {useCallback, useMemo} from 'react';
import {TestCaseProps} from '../TestPerformer';
import SpinningSquare from '../components/SpinningSquare';

const SQUARES_NUMBER = 105;
const TEST_TIME = 5000;

export function SquareRotationAnimationTestWithoutNativeDriver({
  onComplete,
}: TestCaseProps) {
  const onCompleteHandler = useCallback(() => {
    setTimeout(onComplete, TEST_TIME);
  }, [onComplete]);

  const squares = useMemo(
    () =>
      Array.from({length: SQUARES_NUMBER}, (_, i) => (
        <SpinningSquare
          startValue={Math.round(Math.random())}
          useNativeDriver={false}
          key={i}
          onStart={i === SQUARES_NUMBER - 1 ? onCompleteHandler : undefined}
        />
      )),
    [onCompleteHandler],
  );

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>{squares}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  square: {
    width: 10,
    height: 10,
    backgroundColor: 'blue',
  },
});
