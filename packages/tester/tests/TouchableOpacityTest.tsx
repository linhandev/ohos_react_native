import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native';
import {TestSuite} from '@rnoh/testerino';
import {createRef, forwardRef, useState} from 'react';
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
        itShould="Pressing and dragging on the gray square does not trigger the onPress event."
        tags={['sequential']}
        initialState={{
          pressed: false,
          ref: createRef<React.ElementRef<typeof ScrollView>>(),
        }}
        arrange={({state, setState, done}) => {
          return (
            <ScrollViewNestedInTouchableOpacity
              ref={state.ref}
              setState={setState}
              done={done}
            />
          );
        }}
        act={async ({state}) => {
          await driver?.swipe({
            ref: state.ref,
            fromOffset: {x: 120, y: 40},
            toOffset: {x: 40, y: 40},
          });
        }}
        assert={({expect, state}) => {
          expect(state.pressed).to.be.false;
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

const ScrollViewNestedInTouchableOpacity = forwardRef<
  ScrollView,
  {
    setState: React.Dispatch<
      React.SetStateAction<{
        ref: React.RefObject<ScrollView>;
        pressed: boolean;
      }>
    >;
    done: () => void;
  }
>((props, ref) => {
  return (
    <TouchableOpacity
      onPress={() => props.setState((prev: any) => ({...prev, pressed: true}))}>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScrollEndDrag={() => {
          props.done();
        }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            flexDirection: 'row',
            paddingHorizontal: 8,
          }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(value => {
            return (
              <TouchableOpacity
                key={value}
                style={{
                  width: 88,
                  height: 88,
                  marginRight: 8,
                  backgroundColor: '#ddddd' + value,
                }}>
                <Text>{value}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </TouchableOpacity>
  );
});
