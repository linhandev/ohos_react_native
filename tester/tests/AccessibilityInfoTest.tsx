import {TestSuite} from '@rnoh/testerino';
import {useEffect, useState} from 'react';
import {
  AccessibilityChangeEventName,
  AccessibilityInfo,
  Text,
  View,
} from 'react-native';
import {Button, TestCase} from '../components';
import {PALETTE} from '../components/palette';

export function AccessibilityInfoTest() {
  return (
    <TestSuite name="AccessibilityInfo">
      <Text
        style={{
          color: 'black',
          padding: 8,
          borderRadius: 8,
          fontSize: 12,
          backgroundColor: PALETTE.YELLOW_LIGHT,
        }}>
        {
          'To enable screen reader on: HarmonyOS 1) go to Settings > Accessibility features > Accessibility shortcut 2) Assign ScreenReader in "Select feature" option 3) Quickly press the power button three times; Android hold volume up and down for 3 sec.'
        }
      </Text>
      <TestSuite name="addEventListener">
        <TestSuite name="screenReaderChanged">
          <TestCase.Manual
            initialState={false}
            itShould="pass when screen reader is enabled (enable screen reader)"
            arrange={({setState}) => {
              return (
                <AccessibilityInfoScreenReaderStatus
                  onScreenReaderChanged={isEnabled => {
                    if (isEnabled) {
                      setState(true);
                    }
                  }}
                />
              );
            }}
            assert={({expect, state}) => {
              expect(state).to.be.eq(true);
            }}
          />
        </TestSuite>
      </TestSuite>
      <TestSuite name="isScreenReaderEnabled">
        <TestCase.Manual<boolean[]>
          itShould="return true when the screen reader is enabled and false when disabled (test passes when call history includes both states)"
          initialState={[]}
          arrange={({setState, state}) => {
            return (
              <>
                <Text>Call history: {JSON.stringify(state)}</Text>
                <Button
                  label="trigger function"
                  onPress={() => {
                    AccessibilityInfo.isScreenReaderEnabled().then(
                      isScreenReaderEnabled => {
                        setState(prev => [...prev, isScreenReaderEnabled]);
                      },
                    );
                  }}
                />
              </>
            );
          }}
          assert={async ({expect, state}) => {
            await new Promise(resolve => {
              if (state.includes(true) && state.includes(false)) {
                resolve(undefined);
              }
            });
            expect(state.includes(true)).to.be.true;
            expect(state.includes(false)).to.be.true;
          }}
        />
      </TestSuite>

      <TestCase.Example itShould="display red background if Accessibility Service is enabled">
        <AccessibilityInfoAccessibilityServiceEnabled />
      </TestCase.Example>

      <TestCase.Example itShould="display red background if Accessibility Service is changed">
        <AccessibilityInfoAccessibilityServiceChanged />
      </TestCase.Example>
    </TestSuite>
  );
}

function AccessibilityInfoScreenReaderStatus({
  onScreenReaderChanged,
}: {
  onScreenReaderChanged: (isEnabled: boolean) => void;
}) {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const backgroundColor = isScreenReaderEnabled ? 'green' : 'transparent';

  useEffect(() => {
    const listener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      isEnabled => {
        setIsScreenReaderEnabled(isEnabled);
        onScreenReaderChanged(isEnabled);
      },
    );

    AccessibilityInfo.isScreenReaderEnabled().then(isEnabled => {
      setIsScreenReaderEnabled(isEnabled);
      onScreenReaderChanged(isEnabled);
    });
    return () => {
      listener.remove();
    };
  }, []);

  return (
    <View style={{backgroundColor, padding: 16}}>
      <Text>{`Current Screen Reader status: ${isScreenReaderEnabled ? 'enabled' : 'disabled'}`}</Text>
    </View>
  );
}

function AccessibilityInfoAccessibilityServiceEnabled() {
  const [isEnabled, setIsEnabled] = useState(false);
  const backgroundColor = isEnabled ? 'red' : 'transparent';

  useEffect(() => {
    AccessibilityInfo.isAccessibilityServiceEnabled()
      .then(isOptionEnabled => {
        setIsEnabled(isOptionEnabled);
      })
      .catch(err =>
        console.log(
          `Error while testing Accessibility Service Enabled - error: ${err}`,
        ),
      );
  }, []);

  return (
    <View style={{backgroundColor, padding: 16}}>
      <Text>{`Accessibility Service is ${isEnabled ? 'enabled' : 'disabled'}.`}</Text>
    </View>
  );
}

function AccessibilityInfoAccessibilityServiceChanged() {
  const [isEnabled, setIsEnabled] = useState(false);
  const backgroundColor = isEnabled ? 'red' : 'transparent';

  useEffect(() => {
    const listener = AccessibilityInfo.addEventListener(
      'accessibilityServiceChanged' as AccessibilityChangeEventName,
      (isOn: boolean) => {
        setIsEnabled(isOn);
      },
    );

    return function cleanup() {
      listener.remove();
    };
  }, []);

  return (
    <View style={{backgroundColor, padding: 16}}>
      <Text>{`Accessibility Service change is ${isEnabled ? 'enabled' : 'disabled'}.`}</Text>
    </View>
  );
}
