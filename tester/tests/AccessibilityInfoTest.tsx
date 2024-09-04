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
  const [skipMsgIfReaderDisabled, setSkipMsgIfReaderDisabled] = useState<
    undefined | string
  >('Determining screen reader status...');

  useEffect(() => {
    const onScreenReaderChange = (isScreenReaderEnabled: boolean) => {
      if (isScreenReaderEnabled) {
        setSkipMsgIfReaderDisabled(undefined);
      } else {
        setSkipMsgIfReaderDisabled(
          'ScreenReader must be enabled to run this test',
        );
      }
    };

    AccessibilityInfo.isScreenReaderEnabled().then(onScreenReaderChange);
    const listener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      onScreenReaderChange,
    );

    return () => {
      listener.remove();
    };
  }, []);

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
        <TestSuite name="accessibilityServiceChanged">
          <TestCase.Example itShould="display red background if Accessibility Service is changed">
            <AccessibilityInfoAccessibilityServiceChanged />
          </TestCase.Example>
        </TestSuite>
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
        <AccessibilityFeatureStatusTestCase
          itShould="return true when the screen reader is enabled and false when disabled (test passes when call history includes both states)"
          onChangeAccessibilityFeature={() =>
            AccessibilityInfo.isScreenReaderEnabled()
          }
        />
      </TestSuite>

      <TestSuite name="announceForAccessibility">
        <TestCase.Example
          skip={skipMsgIfReaderDisabled}
          itShould="announce 'Button pressed' after pressing the button">
          <Button
            label="Read text"
            onPress={() => {
              AccessibilityInfo.announceForAccessibility('Button pressed');
            }}
          />
        </TestCase.Example>
      </TestSuite>

      <TestSuite name="isAccessibilityServiceEnabled">
        <AccessibilityFeatureStatusTestCase
          itShould="return true when the screen reader (or some other third party accessibility service) is enabled and false when disabled (test passes when call history includes both states)"
          onChangeAccessibilityFeature={() =>
            AccessibilityInfo.isAccessibilityServiceEnabled()
          }
        />
      </TestSuite>
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

function AccessibilityFeatureStatusTestCase({
  itShould,
  onChangeAccessibilityFeature,
  skip,
}: {
  itShould: string;
  onChangeAccessibilityFeature: () => Promise<boolean>;
  skip?: React.ComponentProps<typeof TestCase.Manual>['skip'];
}) {
  return (
    <TestCase.Manual<boolean[]>
      itShould={itShould}
      initialState={[]}
      skip={skip}
      arrange={({setState, state}) => {
        return (
          <>
            <Text>Call history: {JSON.stringify(state)}</Text>
            <Button
              label="trigger function"
              onPress={() => {
                onChangeAccessibilityFeature().then(isScreenReaderEnabled => {
                  setState(prev => [...prev, isScreenReaderEnabled]);
                });
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
  );
}
