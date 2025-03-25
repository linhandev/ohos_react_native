import {
  Text,
  Touchable,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  View,
  ViewProps,
} from 'react-native';
import {TestSuite} from '@rnoh/testerino';
import {createRef, useState} from 'react';
import {TestCase} from '../components';
import {useEnvironment} from '../contexts';

export const TouchablesTest = () => {
  const {
    env: {driver},
  } = useEnvironment();
  const [pressCountHighlight, setPressCountHighlight] = useState(0);
  return (
    <TestSuite name="Touchables">
      <TestCase.Logical
        itShould="export Touchable"
        fn={({expect}) => {
          expect(Touchable).to.be.not.undefined;
        }}
      />
      <TestCase.Example itShould="use cyan background on press in (TouchableHighlight)">
        <TouchableHighlight
          activeOpacity={1}
          underlayColor="cyan"
          onPress={() => {}}>
          <PressMe />
        </TouchableHighlight>
      </TestCase.Example>
      <TestCase.Example itShould="use cyan background, displayed as if pressed (TouchableHighlight)">
        <TouchableHighlight
          activeOpacity={1}
          underlayColor="cyan"
          onPress={() => {}}
          //@ts-ignore
          testOnly_pressed>
          <PressMe />
        </TouchableHighlight>
      </TestCase.Example>
      <TestCase.Example itShould="show number of presses on press in (TouchableHighlight)">
        <TouchableHighlight
          onPress={() => setPressCountHighlight(pressCountHighlight + 1)}>
          <PressMe endLabel={pressCountHighlight} />
        </TouchableHighlight>
      </TestCase.Example>
      <TestCase.Logical
        itShould="export TouchableNativeFeedback (Android only)"
        fn={({expect}) => {
          expect(TouchableNativeFeedback).to.be.not.undefined;
        }}
      />
      <TestCase.Example itShould="handle press without showing feedback">
        <TouchableWithoutFeedbackDemo />
      </TestCase.Example>
      <TestCase.Automated
        tags={['sequential']}
        itShould="handle presses on empty views"
        initialState={{
          pressed: false,
          ref: createRef<View>(),
        }}
        arrange={({setState, state, done}) => {
          return (
            <View style={{height: 100, backgroundColor: 'red'}}>
              <TouchableWithoutFeedback
                onPress={() => {
                  setState(prev => ({...prev, pressed: true}));
                  done();
                }}>
                <View ref={state.ref} style={{height: '100%', width: '100%'}} />
              </TouchableWithoutFeedback>
            </View>
          );
        }}
        act={async ({state}) => {
          await driver?.click({ref: state.ref});
        }}
        assert={({expect, state}) => {
          expect(state.pressed).to.be.true;
        }}
      />
      <TestCase.Automated
        itShould="pass when blue background is pressed"
        tags={['sequential']}
        initialState={{
          pressed: false,
          ref: createRef<View>(),
        }}
        arrange={({setState, done, state}) => (
          <View
            ref={state.ref}
            style={{
              backgroundColor: 'blue',
              alignSelf: 'center',
              position: 'relative',
            }}>
            <TouchableWithoutFeedback
              hitSlop={{top: 48, left: 48, bottom: 48, right: 48}}
              onPress={() => {
                setState((prev: any) => ({...prev, pressed: true}));
                done();
              }}>
              <View style={{width: 48, height: 48, margin: 48}} />
            </TouchableWithoutFeedback>
            <View
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
};

function TouchableWithoutFeedbackDemo() {
  const [counter, setCounter] = useState(0);
  return (
    <TouchableWithoutFeedback onPressIn={() => setCounter(prev => prev + 1)}>
      <PressMe endLabel={counter} />
    </TouchableWithoutFeedback>
  );
}

function PressMe(props: ViewProps & {endLabel?: string | number}) {
  return (
    <View {...props} style={{padding: 16, borderWidth: 1}}>
      <Text style={{color: 'blue', height: 24, width: '100%'}}>
        Press me{props.endLabel !== undefined ? ` (${props.endLabel})` : ''}
      </Text>
    </View>
  );
}
