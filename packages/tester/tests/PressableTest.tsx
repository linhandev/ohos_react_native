import React, {createRef, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {TestSuite} from '@rnoh/testerino';
import {TestCase} from '../components';
import {useEnvironment} from '../contexts';

export function PressableTest() {
  const {
    env: {driver},
  } = useEnvironment();
  return (
    <TestSuite name="Pressable">
      <TestCase.Automated
        tags={['sequential']}
        itShould="handle short presses"
        initialState={{
          onPressIn: false,
          onPress: false,
          ref: createRef<React.ElementRef<typeof Pressable>>(),
        }}
        arrange={({setState, state, done}) => {
          return (
            <Pressable
              ref={state.ref}
              onPressIn={() => setState(prev => ({...prev, onPressIn: true}))}
              onPress={() => {
                setState(prev => ({...prev, onPress: true}));
                done();
              }}>
              <View style={styles.unpressed} />
            </Pressable>
          );
        }}
        act={async ({state}) => {
          await driver?.click({ref: state.ref});
        }}
        assert={({expect, state}) => {
          expect(state).to.include({
            onPressIn: true,
            onPress: true,
          });
        }}
      />
      <TestCase.Automated
        itShould="handle long press"
        tags={['sequential']}
        initialState={{
          onLongPress: false,
          ref: createRef<React.ElementRef<typeof Pressable>>(),
        }}
        arrange={({setState, state, done}) => {
          return (
            <Pressable
              ref={state.ref}
              onLongPress={() => {
                setState(prev => ({...prev, onLongPress: true}));
                // The long click in the test kit is very long.
                // If we don't wait for it to finish and proceed, it will cause the next test to fail.
                setTimeout(done, 1000);
              }}>
              <View style={styles.unpressed} />
            </Pressable>
          );
        }}
        act={async ({state}) => {
          await driver?.longClick({ref: state.ref});
        }}
        assert={({expect, state}) => {
          expect(state).to.include({
            onLongPress: true,
          });
        }}
      />
      <TestCase.Automated
        itShould="handle pressing out"
        tags={['sequential']}
        initialState={{
          onPressOut: false,
          ref: createRef<React.ElementRef<typeof Pressable>>(),
        }}
        arrange={({setState, state, done}) => {
          return (
            <Pressable
              ref={state.ref}
              onPressOut={() => {
                setState(prev => ({...prev, onPressOut: true}));
                done();
              }}>
              <View style={styles.unpressed} />
            </Pressable>
          );
        }}
        act={async ({state}) => {
          await driver?.click({ref: state.ref});
        }}
        assert={({expect, state}) => {
          expect(state).to.include({
            onPressOut: true,
          });
        }}
      />
      <TestCase.Automated
        itShould="inner view should not react to presses"
        tags={['sequential']}
        initialState={{
          tested: false,
          pressed: false,
          ref: createRef<React.ElementRef<typeof Pressable>>(),
        }}
        arrange={({setState, state, done}) => {
          return (
            <Pressable
              onPress={() => {
                setState(prev => ({...prev, tested: true}));
                done();
              }}
              style={styles.pressed}>
              <Pressable
                ref={state.ref}
                onPress={() => {
                  setState(prev => ({...prev, pressed: true}));
                  done();
                }}
                style={styles.unpressed}
                disabled
              />
            </Pressable>
          );
        }}
        act={async ({state}) => {
          await driver?.click({ref: state.ref});
        }}
        assert={({expect, state}) => {
          expect(state).to.include({
            tested: true,
            pressed: false,
          });
        }}
      />
      <TestCase.Example
        itShould="change color to blue on hover"
        skip={{android: false, harmony: true}} // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/417
      >
        <HoverView />
      </TestCase.Example>
      <TestCase.Automated
        itShould="pass when blue background is pressed"
        tags={['sequential']}
        initialState={{
          pressed: false,
          ref: createRef<View>(),
        }}
        arrange={({setState, state, done}) => (
          <View
            style={{
              backgroundColor: 'blue',
              alignSelf: 'center',
              position: 'relative',
            }}>
            <Pressable
              hitSlop={{top: 48, left: 48, bottom: 48, right: 48}}
              style={{
                width: 48,
                height: 48,
                backgroundColor: 'green',
                margin: 48,
              }}
              onPress={() => {
                setState(prev => ({...prev, pressed: true}));
                done();
              }}
            />
            <View
              ref={state.ref}
              style={{
                width: 48,
                height: 48,
                backgroundColor: 'red',
                position: 'absolute',
                top: 48,
                left: 48,
              }}
              onTouchEnd={e => {
                e.stopPropagation();
              }}
            />
          </View>
        )}
        act={async ({state}) => {
          await driver?.click({ref: state.ref, offset: {x: 48, y: 48}});
        }}
        assert={({expect, state}) => {
          expect(state.pressed).to.be.true;
        }}
      />
    </TestSuite>
  );
}

const HoverView = () => {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onHoverIn={() => {
        setHovered(true);
        console.log('onHoverIn');
      }}
      onHoverOut={() => {
        setHovered(false);
        console.log('onHoverOut');
      }}
      style={{...styles.unpressed, backgroundColor: hovered ? 'blue' : 'red'}}
    />
  );
};

const styles = StyleSheet.create({
  unpressed: {
    width: 50,
    height: 50,
    backgroundColor: 'red',
  },
  pressed: {
    width: 100,
    height: 100,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  longPressed: {
    width: 300,
    height: 100,
    backgroundColor: 'green',
  },
  text: {
    height: 20,
    width: 200,
    fontSize: 14,
  },
});
