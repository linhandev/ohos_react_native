import {TestSuite} from '@rnoh/testerino';
import {Button, I18nManager, Text, View} from 'react-native';
import {TestCase} from '../components';
import React from 'react';

export function I18nManagerTest() {
  return (
    <TestSuite name="I18nManager">
      <TestCase.Logical
        itShould="be LTR be true"
        fn={({expect}) => {
          expect(I18nManager.isRTL).to.be.false;
        }}
      />
      <TestCase.Logical
        itShould="doLeftAndRightSwapInRTL to be true"
        fn={({expect}) => {
          expect(I18nManager.doLeftAndRightSwapInRTL).to.be.true;
        }}
      />
      <TestCase.Example
        modal
        itShould="display props correctly when APIs are called">
        <ToggleablePropTest />
      </TestCase.Example>
    </TestSuite>
  );
}

const ToggleablePropTest = () => {
  const [RTLAllowed, setRTLAllowed] = React.useState(true);
  const [RTLForced, setRTLForced] = React.useState(false);

  const toggleRTLAllowed = React.useCallback(() => {
    setRTLAllowed(v => !v);
  }, []);

  const toggleRTLForced = React.useCallback(() => {
    setRTLForced(v => !v);
  }, []);

  React.useEffect(() => {
    I18nManager.allowRTL(RTLAllowed);
  }, [RTLAllowed]);

  React.useEffect(() => {
    I18nManager.forceRTL(RTLForced);
  }, [RTLForced]);

  return (
    <View>
      <Text>{RTLAllowed ? 'RTL Allowed' : 'RTL Not Allowed'}</Text>
      <Text>{RTLForced ? 'RTL Forced' : 'RTL Not Forced'}</Text>
      <Button title="Toggle RTLAllowed" onPress={toggleRTLAllowed} />
      <Button title="Toggle RTLForced" onPress={toggleRTLForced} />
      <Text>I18nManager.isRTL: {I18nManager.isRTL ? 'True' : 'False'}</Text>
      <Text>
        I18nManager.getConstants().isRTL:{' '}
        {I18nManager.getConstants().isRTL ? 'True' : 'False'}
      </Text>
      <Text>
        I18nManager.doLeftAndRightSwapInRTL:{' '}
        {I18nManager.doLeftAndRightSwapInRTL ? 'True' : 'False'}
      </Text>
      <Text>
        I18nManager.getConstants().doLeftAndRightSwapInRTL:{' '}
        {I18nManager.getConstants().doLeftAndRightSwapInRTL ? 'True' : 'False'}
      </Text>
      <Text>
        I18nManager.getConstants().localeIdentifier:{' '}
        {I18nManager.getConstants().localeIdentifier}
      </Text>
    </View>
  );
};
