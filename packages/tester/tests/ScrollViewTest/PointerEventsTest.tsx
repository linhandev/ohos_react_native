import {TestSuite} from '@rnoh/testerino';
import {Platform, ScrollView, View} from 'react-native';
import {getScrollViewContent} from './fixtures';
import {Button} from '../../components';
import {TestCase} from '../../components/TestCase';
import {createRef, forwardRef} from 'react';
import {useEnvironment} from '../../contexts';

export function PointerEventsTest() {
  const {
    env: {driver},
  } = useEnvironment();

  return (
    <TestSuite name="pointer events">
      <TestCase.Automated
        itShould="call inner and outer view when pressing inner"
        tags={['sequential']}
        initialState={{
          inner: false,
          outer: false,
          outerContainer: false,
          scrollViewRef: createRef<React.ElementRef<typeof ScrollView>>(),
        }}
        arrange={({setState, state, done, reset}) => {
          return (
            <PointerEventsView
              pointerEventsOuter="auto"
              setState={props => {
                setState(props);
                done();
              }}
              reset={reset}
              ref={state.scrollViewRef}
            />
          );
        }}
        act={async ({state}) => {
          await driver?.click({ref: state.scrollViewRef});
        }}
        assert={({expect, state}) => {
          expect(state).to.include({
            inner: true,
            outer: true,
            outerContainer: true,
          });
        }}
      />
      <TestCase.Automated
        //it seems there's a bug on Android, which causes pointerEvents to not work correctly for ScrollViews
        skip={Platform.select({
          android: 'known bug',
        })}
        tags={['sequential']}
        itShould="call only outer when pressing inner view"
        initialState={{
          inner: false,
          outer: false,
          outerContainer: true,
          scrollViewRef: createRef<React.ElementRef<typeof ScrollView>>(),
        }}
        arrange={({setState, state, done, reset}) => {
          return (
            <PointerEventsView
              pointerEventsOuter="box-only"
              ref={state.scrollViewRef}
              setState={props => {
                setState(props);
                done();
              }}
              reset={reset}
            />
          );
        }}
        act={async ({state}) => {
          await driver?.click({ref: state.scrollViewRef});
        }}
        assert={({expect, state}) => {
          expect(state).to.include({
            inner: false,
            outer: true,
            outerContainer: true,
          });
        }}
      />
      <TestCase.Automated
        //it seems there's a bug on Android, which causes pointerEvents to not work correctly for ScrollViews
        skip={Platform.select({
          android: 'known bug',
        })}
        tags={['sequential']}
        itShould="call inner and outer only when pressing inner view"
        initialState={{
          inner: false,
          outer: false,
          outerContainer: true,
          scrollViewRef: createRef<React.ElementRef<typeof ScrollView>>(),
        }}
        arrange={({setState, reset, state, done}) => {
          return (
            <PointerEventsView
              disableOuterContainerTouch
              pointerEventsOuter="box-none"
              ref={state.scrollViewRef}
              setState={props => {
                setState(props);
                done();
              }}
              reset={reset}
            />
          );
        }}
        act={async ({state}) => {
          await driver?.click({ref: state.scrollViewRef});
        }}
        assert={({expect, state}) => {
          expect(state.inner).to.be.true;
          expect(state.outer).to.be.true;
        }}
      />
      <TestCase.Automated
        //it seems there's a bug on Android, which causes pointerEvents to not work correctly for ScrollViews
        skip={Platform.select({
          android: 'known bug',
        })}
        itShould="not call inner or outer when pressing inner or outer views"
        initialState={{
          inner: false,
          outer: false,
          outerContainer: true,
          scrollViewRef: createRef<React.ElementRef<typeof ScrollView>>(),
        }}
        arrange={({setState, reset, state, done}) => {
          return (
            <PointerEventsView
              pointerEventsOuter="none"
              ref={state.scrollViewRef}
              setState={props => {
                setState(props);
                done();
              }}
              reset={reset}
            />
          );
        }}
        act={async ({state}) => {
          await driver?.click({ref: state.scrollViewRef});
        }}
        assert={({expect, state}) => {
          expect(state).to.be.deep.eq({
            inner: false,
            outer: false,
            outerContainer: true,
          });
        }}
      />
    </TestSuite>
  );
}

const PointerEventsView = forwardRef<
  ScrollView,
  {
    disableOuterContainerTouch?: boolean;
    pointerEventsOuter?: 'box-none' | 'none' | 'box-only' | 'auto';
    pointerEventsInner?: 'box-none' | 'none' | 'box-only' | 'auto';
    setState: React.Dispatch<
      React.SetStateAction<{
        inner: boolean;
        outer: boolean;
        outerContainer: boolean;
        scrollViewRef: React.RefObject<ScrollView>; // Added this to match TestCase.Automated
      }>
    >;
    reset: () => void;
  }
>((props, ref) => {
  return (
    <View style={{height: 100, width: '100%', flexDirection: 'row'}}>
      <View
        style={{backgroundColor: 'red'}}
        onTouchEnd={
          props.disableOuterContainerTouch
            ? undefined
            : () => {
                props.setState(prev => ({...prev, outerContainer: true}));
              }
        }>
        <ScrollView
          ref={ref}
          nestedScrollEnabled
          style={{
            height: 100,
            width: 100,
            backgroundColor: 'green',
            padding: 20,
          }}
          pointerEvents={props.pointerEventsOuter}
          onTouchEnd={() => {
            props.setState(prev => ({...prev, outer: true}));
          }}>
          {getScrollViewContent({
            amountOfChildren: 3,
            onTouchEnd: () => {
              props.setState(prev => ({...prev, inner: true}));
            },
            pointerEvents: props.pointerEventsInner,
          })}
        </ScrollView>
      </View>
      <Button label="reset" onPress={props.reset} />
    </View>
  );
});
