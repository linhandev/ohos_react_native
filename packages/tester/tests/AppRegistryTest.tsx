import {TestSuite} from '@rnoh/testerino';
import {TestCase} from '../components';
import {AppRegistry} from 'react-native';

export function AppRegistryTest() {
  return (
    <TestSuite name="AppRegistry">
      <TestCase.Logical
        itShould="register section"
        fn={async ({expect}) => {
          AppRegistry.registerSection('foo', () => () => null);
          const sectionKeys = AppRegistry.getSectionKeys();
          expect(sectionKeys).to.include('foo');
        }}
      />
      <TestCase.Logical
        itShould="register runnable"
        fn={async ({expect}) => {
          AppRegistry.registerRunnable('foo', _ => {});
          const runnable = AppRegistry.getRunnable('foo');
          expect(runnable).to.not.be.undefined;
        }}
      />
      <TestCase.Logical
        itShould="execute runnable"
        fn={async ({expect}) => {
          AppRegistry.registerRunnable('bar', appParams => {
            expect(appParams).to.not.be.undefined;
            expect(appParams).to.deep.eq({foo: 'bar'});
          });
          AppRegistry.runApplication('bar', {foo: 'bar'});
        }}
      />
    </TestSuite>
  );
}
