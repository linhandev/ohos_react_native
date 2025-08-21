import React, {useState} from 'react';
import {View, Switch, StyleSheet, Text} from 'react-native';
import {TestSuite} from '@rnoh/testerino';
import {Button, TestCase} from '../components';
import {useEnvironment} from '../contexts';

export function SwitchTest() {
  const {
    env: {driver},
  } = useEnvironment();
  return (
    <TestSuite name="Switch">
      <TestCase.Automated
        tags={['sequential']}
        itShould="render a working switch and display its state and SwitchChangeEvent details"
        initialState={{
          isSwitchEnabled: false,
          event: '',
          trackColor: '',
          ref: React.createRef<React.ElementRef<typeof Switch>>(),
        }}
        arrange={({state, setState}) => (
          <View style={styles.container}>
            <Text style={{height: 30}}>
              Switch isEnabled: {state.isSwitchEnabled.toString()}
            </Text>
            <Text style={{height: 30}}>
              OnChange event: {state.event || 'No event yet'}
            </Text>
            <Switch
              ref={state.ref}
              trackColor={{false: 'green', true: 'firebrick'}}
              thumbColor={'beige'}
              value={state.isSwitchEnabled}
              onChange={e => {
                const eventData = {...e.nativeEvent};
                setState(prev => ({
                  ...prev,
                  event: JSON.stringify(eventData),
                  isSwitchEnabled: eventData.value,
                }));
              }}
            />
          </View>
        )}
        act={async ({state, done}) => {
          await driver?.click({ref: state.ref});
          done();
        }}
        assert={({expect, state}) => {
          expect(state.isSwitchEnabled).to.be.true;
          expect(JSON.parse(state.event).value).to.be.true;
        }}
      />
      <TestCase.Example itShould="Not override value set by prop when clicked">
        <ValuePropExample />
      </TestCase.Example>
      <TestCase.Example itShould="Not send an event when switch value changes via props">
        <ValueEventExample />
      </TestCase.Example>
      <TestCase.Example itShould="Render a disabled switch">
        <View style={styles.container}>
          <Switch
            trackColor={{false: 'green', true: 'firebrick'}}
            thumbColor={'beige'}
            disabled
          />
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="Render a disabled switch with true value">
        <View style={styles.container}>
          <Switch
            trackColor={{false: 'green', true: 'firebrick'}}
            thumbColor={'beige'}
            value={true}
            disabled
          />
        </View>
      </TestCase.Example>
    </TestSuite>
  );
}

const ValuePropExample = () => {
  const [value, setValue] = useState(false);

  return (
    <View style={styles.container}>
      <Switch value={value} />
      <Button onPress={() => setValue(!value)} label="Toggle" />
    </View>
  );
};

const ValueEventExample = () => {
  const [value, setValue] = useState(false);
  const [eventCount, setEventCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text>Event count: {eventCount}</Text>
      <Switch
        value={value}
        onValueChange={v => {
          setEventCount(c => c + 1);
          setValue(v);
        }}
      />
      <Button onPress={() => setValue(!value)} label="Toggle" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
