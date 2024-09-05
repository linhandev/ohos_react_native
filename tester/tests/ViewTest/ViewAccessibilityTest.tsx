import {TestSuite} from '@rnoh/testerino';
import {Text, View} from 'react-native';
import {TestCase} from '../../components';
import React from 'react';

export function ViewAccessibilityTest() {
  return (
    <TestSuite name="Accessibility & Aria props">
      <TestSuite name="aria-valuenow/min/max">
        <TestCase.Manual<number[]>
          initialState={[50]}
          skip={{android: false, harmony: 'Not supported'}}
          itShould="announce values only in range from 0 to 100 and stop incrementing or decrementing values if the current value is equal to aria-valuemax or aria-valuemin"
          arrange={({setState, state}) => {
            return (
              <View
                style={{width: '100%', padding: 16}}
                accessible={true}
                accessibilityRole="adjustable"
                accessibilityActions={[
                  {name: 'increment'},
                  {name: 'decrement'},
                ]}
                onAccessibilityAction={event => {
                  switch (event.nativeEvent.actionName) {
                    case 'increment': {
                      setState(prev => {
                        return [...prev, prev[prev.length - 1] + 25];
                      });
                      break;
                    }
                    case 'decrement': {
                      setState(prev => {
                        return [...prev, prev[prev.length - 1] - 25];
                      });
                      break;
                    }
                  }
                }}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={state[state.length - 1]}>
                <Text importantForAccessibility="no">
                  1. Enable ScreenReader
                </Text>
                <Text importantForAccessibility="no">
                  2. Focus on this View
                </Text>
                <Text importantForAccessibility="no">
                  3. Swipe up or down to increment or decrement the value
                </Text>
                <Text importantForAccessibility="no">
                  Current Fake Slider value: {state[state.length - 1]}
                </Text>
              </View>
            );
          }}
          assert={({state}) => {
            return new Promise(resolve => {
              if (state.includes(0) && state.includes(100)) {
                resolve(undefined);
              }
            });
          }}
        />
      </TestSuite>
      <TestSuite name="aria-valuetext">
        <TestCase.Example
          skip={{android: false, harmony: 'Not supported'}}
          itShould="render a view with aria-valuetext accessibility prop">
          <View
            aria-valuetext={'announcing value from aria-valuetext'}
            style={{width: '100%', padding: 16}}>
            <Text importantForAccessibility="no">1. Enable ScreenReader</Text>
            <Text importantForAccessibility="no">2. Focus on this View</Text>
          </View>
        </TestCase.Example>
      </TestSuite>
    </TestSuite>
  );
}
