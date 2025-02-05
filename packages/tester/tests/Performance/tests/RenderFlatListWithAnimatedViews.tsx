import {FlatList, StyleSheet} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {TestCaseProps} from '../TestPerformer';
import SpinningSquare from '../components/SpinningSquare';

const SQUARES_NUMBER = 25;
const ANIMATION_DURATION = 250; // See RNOH/arkui/ScrollNode.cpp

function SquareItem() {
  const useNativeDriver = true;

  return (
    <SpinningSquare useNativeDriver={useNativeDriver} style={styles.square}>
      <SpinningSquare
        startValue={Math.round(Math.random())}
        useNativeDriver={useNativeDriver}
        style={{
          ...styles.square,
          width: 120,
          height: 120,
        }}>
        <SpinningSquare
          startValue={Math.round(Math.random())}
          useNativeDriver={useNativeDriver}
          style={{
            ...styles.square,
            width: 100,
            height: 100,
            backgroundColor: 'green',
          }}>
          <SpinningSquare
            startValue={Math.round(Math.random())}
            useNativeDriver={useNativeDriver}
            style={{
              ...styles.square,
              width: 70,
              height: 70,
              backgroundColor: 'red',
            }}>
            <SpinningSquare
              startValue={Math.round(Math.random())}
              useNativeDriver={useNativeDriver}
              style={{
                ...styles.square,
                width: 40,
                height: 40,
                backgroundColor: 'blue',
              }}
            />
          </SpinningSquare>
        </SpinningSquare>
      </SpinningSquare>
    </SpinningSquare>
  );
}

export function RenderFlatListWithAnimatedViews({
  onStart,
  onComplete,
}: TestCaseProps) {
  const ref = useRef<FlatList>(null);

  const squares = useMemo(
    () =>
      new Array(SQUARES_NUMBER).fill(0).map((_, index) => ({key: `${index}`})),
    [],
  );

  const onScrollHandler = useCallback(({nativeEvent}: any) => {
    if (nativeEvent?.contentOffset.y > nativeEvent?.contentSize.height - 2000) {
      onComplete();
    }
  }, []);

  useEffect(() => {
    let currentY = 0;
    let scrollOffset = 1000;

    onStart();

    const interval = setInterval(() => {
      ref.current?.scrollToOffset({
        offset: currentY,
        animated: true,
      });
      currentY += scrollOffset;
    }, ANIMATION_DURATION);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <FlatList
      ref={ref}
      data={squares}
      renderItem={() => <SquareItem />}
      keyExtractor={item => item.key}
      onScroll={onScrollHandler}
      contentContainerStyle={styles.contentContainerStyle}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  contentContainerStyle: {
    alignItems: 'center',
  },
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    height: 150,
  },
});
