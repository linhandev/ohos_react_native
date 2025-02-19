import {expect as expect_} from 'chai';
import {useContext, useLayoutEffect} from 'react';
import {
  TestCaseContext,
  TestSuiteContext,
  TestingContext,
} from './TestingContext';
import {ExampleTestCase, ExampleTestCaseProps} from './ExampleTestCase';
import {LogicalTestCase} from './LogicalTestCase';
import {ManualTestCase, SmartManualTestCaseProps} from './ManualTestCase';
import {
  AutomatedTestCase,
  SmartAutomatedTestCaseProps,
} from './AutomatedTestCase';

export function TestCase<TState = undefined>({
  itShould,

  ...otherProps
}: {itShould: string; skip?: boolean | string; tags?: string[]} & (
  | ExampleTestCaseProps
  | {fn: (utils: {expect: typeof expect_}) => Promise<void> | void}
  | SmartManualTestCaseProps<TState>
  | SmartAutomatedTestCaseProps<TState>
)) {
  const {registerTestCase, reportTestCaseResult} = useContext(TestingContext)!;
  const shouldRenderExample = 'children' in otherProps;
  const shouldRenderManualTestCase = 'arrange' in otherProps;
  const shouldRenderAutomatedTestCase = 'act' in otherProps;
  const testSuiteId = useContext(TestSuiteContext)?.testSuiteId;
  const testCaseId = `${testSuiteId ?? ''}::${itShould}`;

  useLayoutEffect(() => {
    return registerTestCase(testCaseId);
  }, [testCaseId]);

  return (
    <TestCaseContext.Provider
      value={{
        reportTestCaseResult: result => {
          reportTestCaseResult(testCaseId, result);
        },
      }}>
      {shouldRenderExample ? (
        <ExampleTestCase itShould={itShould} {...otherProps}>
          {otherProps.children}
        </ExampleTestCase>
      ) : shouldRenderAutomatedTestCase ? (
        <AutomatedTestCase itShould={itShould} {...otherProps} />
      ) : shouldRenderManualTestCase ? (
        <ManualTestCase itShould={itShould} {...otherProps} />
      ) : (
        <LogicalTestCase name={itShould} {...otherProps} />
      )}
    </TestCaseContext.Provider>
  );
}
