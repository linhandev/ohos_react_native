import {Tester, Filter} from '@rnoh/testerino';
import {useEffect} from 'react';
import {View, Systrace} from 'react-native';
import * as tests from './../tests';

export function SequentialTester({filter}: {filter?: Filter}) {
  useEffect(() => {
    const traceCookie = Systrace.beginAsyncEvent('#TESTER::TESTS_VISIBLE');
    return () => {
      Systrace.endAsyncEvent('#TESTER::TESTS_VISIBLE', traceCookie);
    };
  }, []);

  return (
    <View style={{width: '100%', height: '100%', backgroundColor: '#222'}}>
      <Tester
        style={{flexDirection: 'column', height: '100%'}}
        sequential={{pauseOnFailure: true}}
        filter={filter}>
        {Object.keys(tests).map(testSuiteName => {
          const TestSuite = tests[testSuiteName as keyof typeof tests];
          return <TestSuite key={testSuiteName} />;
        })}
      </Tester>
    </View>
  );
}
