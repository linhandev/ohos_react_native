import {useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {Button, TestCase} from '../../components';
import {TestSuite} from '@rnoh/testerino';

export function MomentumCallbacksTest() {
  return (
    <TestSuite name="onMomentumScrollBegin/End">
      <TestCase.Example
        itShould="display amount of on drag/momentum begin/end events"
        modal>
        <MomentumTestCase />
      </TestCase.Example>
      <TestCase.Manual<string[]>
        skip={{
          android: "skipped because on Android ScrollView doesn't bounce",
          harmony: {arkTS: true, cAPI: false},
        }}
        itShould="execute callbacks in the identical order as iOS during a bounce"
        modal
        initialState={[]}
        arrange={({setState, state, reset}) => (
          <View style={{height: 256, backgroundColor: 'silver'}}>
            <ScrollView
              bounces={true}
              onScrollBeginDrag={() => {
                reset();
                setState(prev => [...prev, 'onScrollBeginDrag (1/4)']);
              }}
              onScrollEndDrag={() => {
                setState(prev => [...prev, 'onScrollEndDrag (2/4)']);
              }}
              onMomentumScrollBegin={() => {
                setState(prev => [...prev, 'onMomentumScrollBegin (3/4)']);
              }}
              onMomentumScrollEnd={() => {
                setState(prev => [...prev, 'onMomentumScrollEnd (4/4)']);
              }}>
              <View
                style={{
                  height: 256,
                  backgroundColor: 'blue',
                  padding: 64,
                }}>
                <Text style={{color: 'white'}}>SCROLL ME UP OR DOWN</Text>
                <Text style={{color: 'white', opacity: 0.5}}>
                  {state.join('\n')}
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
        assert={async ({expect, state}) => {
          await new Promise(resolve => {
            if (state.length === 4) {
              resolve(undefined);
            }
          });
          expect(state[0]).to.have.string('onScrollBeginDrag');
          expect(state[1]).to.have.string('onScrollEndDrag');
          expect(state[2]).to.have.string('onMomentumScrollBegin');
          expect(state[3]).to.have.string('onMomentumScrollEnd');
        }}
      />
    </TestSuite>
  );
}

function MomentumTestCase() {
  const [hasDragBegan, setHasDragBegan] = useState(0);
  const [hasDragEnded, setHasDragEnded] = useState(0);
  const [hasMomentumBegan, setHasMomentumBegan] = useState(0);
  const [hasMomentumEnded, setHasMomentumEnded] = useState(0);

  return (
    <>
      <Button
        label="Reset"
        onPress={() => {
          setHasDragBegan(0);
          setHasDragEnded(0);
          setHasMomentumBegan(0);
          setHasMomentumEnded(0);
        }}
      />
      <View style={{backgroundColor: 'white', width: '100%'}}>
        <Text style={{height: 16}}>hasMomentumBegan: {hasMomentumBegan}</Text>
        <Text style={{height: 16}}>hasMomentumEnded: {hasMomentumEnded}</Text>
        <Text style={{height: 16}}>hasDragBegan: {hasDragBegan}</Text>
        <Text style={{height: 16}}>hasDragEnded: {hasDragEnded}</Text>
      </View>

      <View style={{width: 200, height: 200}}>
        <ScrollView
          onScrollBeginDrag={() => {
            setHasDragBegan(p => p + 1);
          }}
          onScrollEndDrag={() => {
            setHasDragEnded(p => p + 1);
          }}
          onMomentumScrollBegin={() => {
            setHasMomentumBegan(p => p + 1);
          }}
          onMomentumScrollEnd={() => {
            setHasMomentumEnded(p => p + 1);
          }}>
          <View style={{backgroundColor: 'red', width: '100%', height: 150}} />
          <View style={{backgroundColor: 'blue', width: '100%', height: 150}} />
          <View
            style={{backgroundColor: 'green', width: '100%', height: 150}}
          />
          <View style={{backgroundColor: 'red', width: '100%', height: 150}} />
          <View style={{backgroundColor: 'blue', width: '100%', height: 150}} />
          <View
            style={{backgroundColor: 'green', width: '100%', height: 150}}
          />
          <View style={{backgroundColor: 'red', width: '100%', height: 150}} />
          <View style={{backgroundColor: 'blue', width: '100%', height: 150}} />
        </ScrollView>
      </View>
    </>
  );
}
