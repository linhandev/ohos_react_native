import {expect as expect_} from 'chai';
import {useContext, useEffect, useLayoutEffect} from 'react';
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
import {TestCaseType} from './TestingContext';

export function getTestCaseTypeFromProps(
  props: Record<string, any>,
): TestCaseType | null {
  if ('fn' in props) {
    return 'logical';
  }
  if ('act' in props) {
    return 'automated';
  }
  if ('arrange' in props) {
    return 'manual';
  }
  if ('itShould' in props) {
    return 'example';
  }
  return null;
}

export function TestCase<TState = undefined>(
  props: {itShould: string; skip?: boolean | string; tags?: string[]} & (
    | ExampleTestCaseProps
    | {fn: (utils: {expect: typeof expect_}) => Promise<void> | void}
    | SmartManualTestCaseProps<TState>
    | SmartAutomatedTestCaseProps<TState>
  ),
) {
  const {itShould, tags, ...otherProps} = props;

  const {registerTestCase, reportTestCaseResult, filter, isSequential} =
    useContext(TestingContext)!;
  const shouldRenderExample = 'children' in otherProps;
  const shouldRenderManualTestCase = 'arrange' in otherProps;
  const shouldRenderAutomatedTestCase = 'act' in otherProps;
  const {testSuiteId, onTestCaseIgnored} = useContext(TestSuiteContext)!;
  const testCaseId = `${testSuiteId ?? ''}::${itShould}`;

  const testCaseType = getTestCaseTypeFromProps(props);
  const shouldBeIgnored =
    testCaseType === null
      ? true
      : !filter({
          tags: tags ?? [],
          testCaseType: testCaseType,
        });

  useLayoutEffect(() => {
    if (isSequential) {
      return;
    }
    if (shouldBeIgnored) {
      onTestCaseIgnored(testCaseId);
      return;
    }
    return registerTestCase(testCaseId);
  }, []);

  useEffect(() => {
    if (!isSequential) {
      return;
    }
    if (shouldBeIgnored) {
      onTestCaseIgnored(testCaseId);
      return;
    }
    return registerTestCase(testCaseId);
  }, []);

  if (shouldBeIgnored) {
    return null;
  }

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
