import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native';
import {TestSuite} from '@rnoh/testerino';
import {createRef, useState} from 'react';
import {TestCase} from '../components';
import {useEnvironment} from '../contexts';

export const TouchableOpacityTest = () => {
  const [pressCountOpacity, setPressCountOpacity] = useState(0);
  const [onLayoutTestText, setOnLayoutTestText] = useState('');
  const {
    env: {driver},
  } = useEnvironment();
  return (
    <TestSuite name="TouchableOpacity">
      <TestCase.Example itShould="make the text less visible on press">
        <TouchableOpacity onPress={() => {}}>
          <PressMe />
        </TouchableOpacity>
      </TestCase.Example>
      <TestCase.Example itShould="make the text slightly less visible on press (activeOpacity)">
        <TouchableOpacity activeOpacity={0.5} onPress={() => {}}>
          <PressMe />
        </TouchableOpacity>
      </TestCase.Example>
      <TestCase.Example itShould="show number of presses on press">
        <TouchableOpacity
          onPress={() => setPressCountOpacity(pressCountOpacity + 1)}>
          <PressMe endLabel={pressCountOpacity} />
        </TouchableOpacity>
      </TestCase.Example>
      <TestCase.Example itShould="render disabled">
        <TouchableOpacity disabled>
          <PressMe endLabel={'disabled'} />
        </TouchableOpacity>
      </TestCase.Example>
      <TestCase.Example itShould="show layout data onLayout">
        <TouchableOpacity
          onLayout={event => {
            setOnLayoutTestText(JSON.stringify(event.nativeEvent.layout));
          }}>
          <PressMe style={{height: 100}} endLabel={onLayoutTestText} />
        </TouchableOpacity>
      </TestCase.Example>
      <TestCase.Example itShould="show square (red background, white border, rounded corners)">
        <TouchableOpacity
          style={{
            backgroundColor: 'rgb(255, 0, 0)',
            width: 100,
            height: 100,
            borderWidth: 3,
            borderColor: 'white',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 30,
            borderBottomLeftRadius: 40,
          }}>
          <PressMe />
        </TouchableOpacity>
      </TestCase.Example>
      <TestCase.Automated
        itShould="Gray square does not trigger onPress when pressed and dragged; pink square does not trigger onScroll."
        tags={['sequential']}
        initialState={{
          pressIn: 0,
          pressed: 0,
          scrolled: 0,
          ref: createRef<React.ElementRef<typeof View>>(),
        }}
        arrange={({state, setState, done}) => {
          return (
            <ScrollViewNestedInTouchableOpacity
              draggingTargetRef={state.ref}
              onTouchableOpacityPressIn={() => {
                setState(prev => ({...prev, pressIn: prev.pressIn + 1}));
              }}
              onParentTouchableOpacityPress={() => {
                setState(prev => ({...prev, pressed: prev.pressed + 1}));
              }}
              onFinishedDragging={() => {
                setState(prev => ({...prev, scrolled: prev.scrolled + 1}));
                done();
              }}
            />
          );
        }}
        act={async ({state}) => {
          await driver?.swipe({
            ref: state.ref,
            fromOffset: {x: 60, y: 0},
            toOffset: {x: 0, y: 0},
          });
          await driver?.swipe({
            ref: state.ref,
            fromOffset: {x: 0, y: 0},
            toOffset: {x: -100, y: 0},
          });
        }}
        assert={({expect, state}) => {
          expect(state.pressIn).to.be.eq(1);
          expect(state.pressed).to.be.eq(1);
          expect(state.scrolled).to.be.eq(1);
        }}
      />
    </TestSuite>
  );
};

function PressMe(props: ViewProps & {endLabel?: string | number}) {
  return (
    <View {...props} style={[{padding: 16, borderWidth: 1}, props.style]}>
      <Text style={{color: 'blue', height: 'auto', width: '100%'}}>
        Press me{props.endLabel !== undefined ? ` (${props.endLabel})` : ''}
      </Text>
    </View>
  );
}

function ScrollViewNestedInTouchableOpacity(props: {
  onParentTouchableOpacityPress: () => void;
  onTouchableOpacityPressIn: () => void;
  onFinishedDragging: () => void;
  draggingTargetRef: React.Ref<View>;
}) {
  return (
    <TouchableOpacity
      style={{backgroundColor: 'pink'}}
      onPress={() => {
        props.onParentTouchableOpacityPress();
      }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onScrollEndDrag={() => {
          setTimeout(() => {
            props.onFinishedDragging();
          }, 100);
        }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            flexDirection: 'row',
          }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(value => {
            return (
              <TouchableOpacity
                ref={value === 1 ? props.draggingTargetRef : undefined}
                key={value}
                onPressIn={() => props.onTouchableOpacityPressIn()}
                style={{
                  width: 64,
                  height: 64,
                  marginRight: 64,
                  backgroundColor: '#ddddd' + value,
                }}>
                <Text>
                  {value}
                  {value === 1 ? ' (target)' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </TouchableOpacity>
  );
}
