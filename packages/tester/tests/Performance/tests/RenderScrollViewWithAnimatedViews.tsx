import {ScrollView, StyleSheet} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {TestCaseProps} from '../TestPerformer';
import SpinningSquare from '../components/SpinningSquare';

const SQUARES_NUMBER = 25;
const SCROLL_OFFSET_INCREASE = 500;
const ANIMATION_DURATION = 250; // See RNOH/arkui/ScrollNode.cpp

function Squares() {
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

export function RenderScrollViewWithAnimatedViews({
  onStart,
  onComplete,
}: TestCaseProps) {
  const ref = useRef<ScrollView>(null);

  const squares = useMemo(
    () =>
      new Array(SQUARES_NUMBER)
        .fill(0)
        .map((_, index) => <Squares key={index} />),
    [],
  );

  const onScrollHandler = useCallback(({nativeEvent}: any) => {
    if (nativeEvent?.contentOffset.y > nativeEvent?.contentSize.height - 1000) {
      onComplete();
    }
  }, []);

  useEffect(() => {
    let currentY = 0;
    let scrollOffset = 5000;

    onStart();

    const interval = setInterval(() => {
      ref.current?.scrollTo({
        y: currentY,
        animated: true,
      });
      currentY += scrollOffset;
      scrollOffset += SCROLL_OFFSET_INCREASE;
    }, ANIMATION_DURATION);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <ScrollView
      onScroll={onScrollHandler}
      ref={ref}
      style={styles.container}
      contentContainerStyle={styles.contentContainerStyle}>
      {squares}
    </ScrollView>
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
