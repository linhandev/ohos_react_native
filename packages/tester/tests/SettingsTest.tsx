import {Settings} from 'react-native';
import {TestSuite} from '@rnoh/testerino';
import {TestCase} from '../components/TestCase';

export function SettingsTest() {
  return (
    <TestSuite name="Settings">
      <TestCase.Logical
        itShould="not throw error"
        fn={() => {
          Settings.get('foobar');
        }}
      />
    </TestSuite>
  );
}
