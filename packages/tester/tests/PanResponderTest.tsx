import {
  ActivityIndicator,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {TestSuite} from '@rnoh/testerino';
import {useRef, useState} from 'react';
import {TestCase} from '../components';
import React from 'react';

export const PanResponderTest = () => {
  return (
    <TestSuite name="PanResponder">
      <TestCase.Logical
        itShould="create PanResponder"
        fn={({expect}) => {
          expect(PanResponder.create({})).to.be.not.empty;
        }}
      />
      <TestCase.Example modal itShould="allow panning inside ScrollView">
        <PanResponderInScrollView />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="allow panning inside ScrollView with refreshControl">
        <PanResponderInScrollViewWithRefresh />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="allow panning outside ScrollView without affecting its scrolling behavior">
        <ScrollViewNestedInPanResponder />
      </TestCase.Example>
    </TestSuite>
  );
};

const PanResponderInScrollView = () => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return true;
      },
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.extractOffset();
      },
      onShouldBlockNativeResponder: () => {
        return true;
      },
    }),
  ).current;

  return (
    <ScrollView style={styles.scrollview} horizontal pagingEnabled>
      <View style={[styles.base, styles.view1]}>
        <Animated.View
          style={{
            transform: [{translateX: pan.x}, {translateY: pan.y}],
          }}
          {...panResponder.panHandlers}>
          <View style={styles.box} />
        </Animated.View>
      </View>
      <View style={[styles.base, styles.view2]} />
      <View style={[styles.base, styles.view1]} />
      <View style={[styles.base, styles.view2]} />
    </ScrollView>
  );
};

const PanResponderInScrollViewWithRefresh = () => {
  const pan = useRef(new Animated.ValueXY()).current;

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return true;
      },
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.extractOffset();
      },
      onShouldBlockNativeResponder: () => {
        return true;
      },
    }),
  ).current;

  return (
    <ScrollView
      style={styles.scrollview}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      pagingEnabled>
      <View style={[styles.base, styles.view1]}>
        <Animated.View
          style={{
            transform: [{translateX: pan.x}, {translateY: pan.y}],
          }}
          {...panResponder.panHandlers}>
          <View style={styles.box} />
        </Animated.View>
      </View>
      <View style={[styles.base, styles.view2]} />
      <View style={[styles.base, styles.view1]} />
      <View style={[styles.base, styles.view2]} />
    </ScrollView>
  );
};

const ScrollViewNestedInPanResponder = () => {
  const [refreshing, setRefreshing] = useState(false);
  const scrollOffsetY = useRef(0);
  const headerHeight = 80;
  const pan = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return scrollOffsetY.current <= 0;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return scrollOffsetY.current <= 0 && gestureState.dy >= 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!refreshing) {
          const dy = Math.min(gestureState.dy * 0.5, headerHeight * 2.5);
          pan.setValue(dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > headerHeight && !refreshing) {
          handleRefresh();
        }
        resetAnimation();
      },
      onPanResponderTerminate: () => resetAnimation(),
    }),
  ).current;

  const handleRefresh = async (): Promise<void> => {
    if (refreshing) {
      return;
    }
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const resetAnimation = (): void => {
    Animated.spring(pan, {
      toValue: 0,
      friction: 8,
      useNativeDriver: true,
    }).start(() => {
      pan.setValue(0);
    });
  };

  const rotate = pan.interpolate({
    inputRange: [0, headerHeight * 2.5],
    outputRange: ['0deg', '180deg'],
  });

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    scrollOffsetY.current = event.nativeEvent.contentOffset.y;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            height: headerHeight,
            transform: [{translateY: pan}],
          },
        ]}>
        <Animated.View style={{transform: [{rotate}], backgroundColor: 'red'}}>
          {refreshing ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <Text>{'⬇️ Pull down to refresh'}</Text>
          )}
        </Animated.View>
      </Animated.View>
      <Animated.View
        style={{
          transform: [{translateY: pan}],
          backgroundColor: 'yellow',
        }}
        {...panResponder.panHandlers}>
        <Animated.ScrollView onScroll={handleScroll} overScrollMode={'never'}>
          <View style={{backgroundColor: 'lightgreen', height: 1000}} />
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  view1: {
    backgroundColor: 'pink',
  },
  view2: {
    backgroundColor: 'powderblue',
  },
  base: {
    height: 400,
    width: 300,
  },
  scrollview: {
    borderWidth: 2,
    borderColor: 'black',
    height: 400,
    width: 300,
  },
  box: {
    height: 100,
    width: 100,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  container: {
    height: 400,
    width: 300,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
