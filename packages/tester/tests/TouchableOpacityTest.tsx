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
        itShould="not trigger parent's onPress when dragging started over a gray square"
        tags={['sequential']}
        initialState={{
          hasParentTouchableOpacityBeenPressed: false,
          ref: createRef<React.ElementRef<typeof View>>(),
        }}
        arrange={({state, setState, done}) => {
          return (
            <ScrollViewNestedInTouchableOpacity
              draggingTargetRef={state.ref}
              onParentTouchableOpacityPress={() => {
                setState((prev: any) => ({
                  ...prev,
                  hasParentTouchableOpacityBeenPressed: true,
                }));
              }}
              onFinishedDragging={done}
            />
          );
        }}
        act={async ({state}) => {
          await driver?.swipe({
            ref: state.ref,
            fromOffset: {x: 0, y: 0},
            toOffset: {x: -100, y: 0},
          });
        }}
        assert={({expect, state}) => {
          expect(state.hasParentTouchableOpacityBeenPressed).to.be.false;
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
