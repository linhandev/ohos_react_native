import {View, ScrollView, Text, StyleSheet, RefreshControl} from 'react-native';
import React, {createRef, useState} from 'react';
import {Button} from '../../components';
import {StylesTest} from './StylesTest';
import {ContentContainerStyleTest} from './ContentContainerStyleTest';
import {ScrollBarsTest} from './ScrollBarsTest';
import {StickyHeadersTest} from './StickyHeadersTest';
import {PointerEventsTest} from './PointerEventsTest';
import {SnapTest} from './SnapTest';
import {MomentumCallbacksTest} from './MomentumCallbacksTest';
import {KeyboardTest} from './KeyboardTest';
import {MiscPropsTest} from './MiscPropsTest';
import {ScrollToTest} from './ScrollToTest';
import {CenterContentTest} from './CenterContentTest';
import RemoveClippedTest from './RemoveClippedTest';
import {OverScrollTest} from './OverScrollTest';
import {TestCase} from '../../components';
import {TestSuite} from '@rnoh/testerino';
import {useEnvironment} from '../../contexts';

export function ScrollViewTest() {
  const {
    env: {driver},
  } = useEnvironment();

  return (
    <TestSuite name="ScrollView">
      <TestSuite name="onScroll">
        <TestCase.Automated
          skip={{android: true, harmony: !driver}}
          tags={['sequential']}
          itShould="receive negative offsetY when refreshControl is provided"
          initialState={{
            ref: createRef<ScrollView>(),
            offsetsY: [] as number[],
          }}
          arrange={({setState, done, state}) => {
            return (
              <>
                <ScrollView
                  ref={state.ref}
                  style={{height: 400}}
                  onScroll={e => {
                    const offsetY = e.nativeEvent.contentOffset.y;
                    setState(current => ({
                      ...current,
                      offsetsY: [...current.offsetsY, offsetY],
                    }));
                  }}
                  onScrollEndDrag={() => done()}
                  refreshControl={
                    <RefreshControl refreshing={false} onRefresh={() => {}} />
                  }>
                  {[1, 2, 3, 4, 5].map(value => {
                    return (
                      <View
                        key={value}
                        style={{
                          width: '100%',
                          height: 64,
                          backgroundColor: 'pink',
                          marginBottom: 64,
                        }}
                      />
                    );
                  })}
                </ScrollView>
              </>
            );
          }}
          act={({state}) => {
            driver?.swipe({
              ref: state.ref,
              fromOffset: {x: 0, y: 0},
              toOffset: {x: 0, y: 100},
              speed: 5000,
            });
          }}
          assert={({expect, state}) => {
            expect(
              state.offsetsY.some(offsetY => offsetY < -50),
              'Expected some offsetY to be significantly negative',
            ).to.be.true;
            expect(
              state.offsetsY.filter(offsetY => offsetY < 0).length,
              'Expected few onScroll events with a negative offset',
            ).to.be.greaterThan(5);
          }}
        />
      </TestSuite>
      <TestSuite name="scrolling">
        <TestCase.Automated
          skip={{android: true, harmony: !driver}}
          tags={['sequential']}
          itShould="scroll when padding is set"
          initialState={{
            scrollViewRef: createRef<ScrollView>(),
            targetRef: createRef<View>(),
            hasPressedTarget: false,
          }}
          arrange={({state, setState, done}) => {
            return (
              <ScrollView
                ref={state.scrollViewRef}
                style={{
                  paddingLeft: 6,
                  height: 256,
                  width: 256,
                }}>
                <View
                  style={{
                    width: 256,
                    height: 256,
                    backgroundColor: 'gray',
                  }}
                />
                <View
                  onTouchEnd={() => {
                    setState(prev => ({...prev, hasPressedTarget: true}));
                    done();
                  }}
                  ref={state.targetRef}
                  style={{
                    width: 256,
                    height: 64,
                    backgroundColor: 'red',
                  }}
                />
              </ScrollView>
            );
          }}
          act={async ({state}) => {
            await driver?.swipe({
              ref: state.scrollViewRef,
              fromOffset: {x: 0, y: 0},
              toOffset: {x: 0, y: -100},
              speed: 5000,
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
            await driver?.click({ref: state.targetRef});
          }}
          assert={({expect, state}) => {
            expect(state.hasPressedTarget).to.be.true;
          }}
        />
      </TestSuite>
      <StylesTest />
      <ContentContainerStyleTest />
      <ScrollBarsTest />
      <StickyHeadersTest />
      <PointerEventsTest />
      <RemoveClippedTest />
      <SnapTest />
      <MomentumCallbacksTest />
      <KeyboardTest />
      <ScrollToTest />
      <MiscPropsTest />
      <CenterContentTest />
      <OverScrollTest />
      <TestCase.Example
        modal
        itShould="maintain scroll position when adding/removing elements">
        <AppendingList />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="pick partially visible element as scroll anchor when growing the content size">
        <ScrollAnchorsTest />
      </TestCase.Example>
      <TestCase.Example
        modal
        skip={{harmony: true, android: false}} // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/498
        itShould="fill the remaining space of scroll view with yellow color but the element inside scroll view remains transparent">
        <ScrollViewEndFillColorTest />
      </TestCase.Example>
    </TestSuite>
  );
}

const Item = (props: {label: string; mode: 'dark' | 'light'}) => {
  const stylesheet = StyleSheet.create({
    dark: {
      backgroundColor: '#47443D',
      color: 'white',
    },
    light: {
      backgroundColor: '#D9D0BB',
      color: 'black',
    },
    item: {
      height: 100,
    },
  });
  return (
    <View
      style={[
        props.mode === 'dark' ? stylesheet.dark : stylesheet.light,
        stylesheet.item,
      ]}>
      <Text>{props.label}</Text>
    </View>
  );
};

const ITEMS = Array.from({length: 20}, (_, index) => (
  <Item
    label={`Item${index}`}
    key={`item${index}`}
    mode={index % 2 ? 'light' : 'dark'}
  />
));
let itemCount = 20;
const AppendingList = () => {
  const [items, setItems] = useState<React.JSX.Element[]>(ITEMS);
  const styles = StyleSheet.create({
    scrollView: {
      width: 300,
      marginVertical: 50,
      height: 500,
    },
    row: {
      flexDirection: 'row',
    },
  });
  return (
    <View>
      <ScrollView
        automaticallyAdjustContentInsets={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        nestedScrollEnabled
        style={styles.scrollView}>
        {items.map((value, _index, _array) => React.cloneElement(value))}
      </ScrollView>
      <View style={styles.row}>
        <Button
          label="Add to top"
          onPress={() => {
            setItems(prev => {
              const idx = itemCount++;
              return [
                <Item
                  label={`added Item ${idx}`}
                  key={`item${idx}`}
                  mode={idx % 2 ? 'light' : 'dark'}
                />,
              ].concat(prev);
            });
          }}
        />
        <Button
          label="Remove top"
          onPress={() => {
            setItems(prev => prev.slice(1));
          }}
        />
      </View>
      <View style={styles.row}>
        <Button
          label="Add to end"
          onPress={() => {
            setItems(prev => {
              const idx = itemCount++;
              return prev.concat([
                <Item
                  label={`added Item ${idx}`}
                  key={`item${idx}`}
                  mode={idx % 2 ? 'light' : 'dark'}
                />,
              ]);
            });
          }}
        />
        <Button
          label="Remove end"
          onPress={() => {
            setItems(prev => prev.slice(0, -1));
          }}
        />
      </View>
    </View>
  );
};

const ScrollAnchorsTest = () => {
  const [height, setHeight] = useState(400);
  const grow = () => {
    setHeight(prev => prev + 50);
  };

  return (
    <View
      style={{
        height: 500,
      }}>
      <Button onPress={grow} label="Grow" />
      <Button
        onPress={() => {
          setHeight(400);
        }}
        label="Reset"
      />
      <ScrollView
        style={{borderColor: 'black', borderWidth: 3}}
        contentContainerStyle={{alignItems: 'center'}}
        maintainVisibleContentPosition={{minIndexForVisible: 0}}>
        <View
          style={{
            height: height,
            width: '80%',
            backgroundColor: 'green',
            borderColor: 'black',
            borderWidth: 3,
          }}
          key="green"
        />
        <View
          style={{
            height: height,
            width: '80%',
            backgroundColor: 'blue',
            borderColor: 'black',
            borderWidth: 3,
          }}
          key="blue"
        />
      </ScrollView>
    </View>
  );
};

function ScrollViewEndFillColorTest() {
  return (
    <View
      style={{
        backgroundColor: 'pink',
        width: '100%',
        justifyContent: 'center',
      }}>
      <View
        style={{
          height: 400,
          marginTop: 50,
          marginBottom: 50,
        }}>
        <ScrollView endFillColor={'yellow'}>
          <View
            style={{
              height: 100,
              borderWidth: 1,
              borderColor: '#000',
              padding: 10,
            }}>
            <Text>Content smaller than scroll view</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
