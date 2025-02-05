import {Image, FlatList, StyleSheet, View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {TestCaseProps} from '../TestPerformer';

const SQUARES_NUMBER = 250;
const ANIMATION_DURATION = 250; // See RNOH/arkui/ScrollNode.cpp
const LOCAL_IMAGE_ASSET_ID = require('../../../assets/pravatar-131.jpg');

function SquareItem() {
  return (
    <View style={styles.square}>
      <View
        style={{
          ...styles.square,
          width: 150,
          height: 150,
        }}>
        <Image
          style={{borderRadius: 8, borderWidth: 1, width: 120, height: 120}}
          source={LOCAL_IMAGE_ASSET_ID}
        />
        <View
          style={{
            ...styles.square,
            width: 100,
            height: 100,
            backgroundColor: 'green',
          }}>
          <View
            style={{
              ...styles.square,
              width: 70,
              height: 70,
              backgroundColor: 'red',
            }}>
            <View
              style={{
                ...styles.square,
                width: 40,
                height: 40,
                backgroundColor: 'blue',
              }}
            />
          </View>
        </View>
        <Image
          style={{
            borderRadius: 8,
            borderWidth: 1,
            width: 120,
            height: 120,
            position: 'absolute',
            left: 80,
          }}
          source={LOCAL_IMAGE_ASSET_ID}
        />
        <Image
          style={{
            borderRadius: 8,
            borderWidth: 1,
            width: 120,
            height: 120,
            position: 'absolute',
            top: 70,
            right: 120,
          }}
          source={LOCAL_IMAGE_ASSET_ID}
        />
      </View>
    </View>
  );
}

export function RenderFlatListWith250Views({
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
    let scrollOffset = 100;

    onStart();

    const interval = setInterval(() => {
      ref.current?.scrollToOffset({
        offset: currentY,
        animated: true,
      });
      currentY += scrollOffset;
      scrollOffset += 50;
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
      initialNumToRender={50} // Number of items to render initially
      maxToRenderPerBatch={100} // Number of items to render per batch
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
    width: 200,
    height: 200,
  },
});
