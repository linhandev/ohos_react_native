import { useContext, useEffect, useState } from 'react';
import { TestCaseState } from '../core';
import { TestCaseContext } from './TestingContext';
import { AssertionError, expect as expect_ } from 'chai';
import { TestCaseStateTemplate } from './TestCaseStateTemplate';
import { PALETTE } from './palette';
import { StyleSheet, Text, View } from 'react-native';

export type SmartManualTestCaseProps<TState> = {
  initialState: TState;
  itShould: string;
  skip?: boolean | string;
  modal?: boolean;
  arrange: (ctx: {
    state: TState;
    setState: React.Dispatch<React.SetStateAction<TState>>;
    reset: () => void;
  }) => JSX.Element;
  assert: (utils: {
    expect: typeof expect_;
    state: TState;
  }) => Promise<void> | void;
};

export function ManualTestCase<TState>({
  initialState,
  itShould,
  skip,
  modal,
  arrange,
  assert,
}: SmartManualTestCaseProps<TState>) {
  const [value, setValue] = useState(initialState);
  const [isInitialRun, setIsInitialRun] = useState(true);
  const [result, setResult] = useState<TestCaseState>(
    skip
      ? {
          status: 'skipped',
          message: typeof skip === 'string' ? skip : undefined,
        }
      : { status: 'waitingForTester' }
  );
  const { reportTestCaseResult } = useContext(TestCaseContext)!;

  useEffect(() => {
    if (isInitialRun) {
      reportTestCaseResult(skip ? 'skipped' : 'waitingForTester');
      setIsInitialRun(false);
      return;
    }
    (async () => {
      try {
        setResult({ status: 'running' });
        await assert({ expect: expect_, state: value });
        setResult({ status: 'pass' });
        reportTestCaseResult('pass');
      } catch (err) {
        if (err instanceof AssertionError) {
          setResult({ status: 'fail', message: err.message });
          reportTestCaseResult('fail');
        } else if (err instanceof Error) {
          setResult({ status: 'broken', message: err.message });
          reportTestCaseResult('broken');
        } else {
          setResult({ status: 'broken', message: '' });
          reportTestCaseResult('broken');
        }
      }
    })();
  }, [value]);

  const renderTestContent = () => (
    <View style={styles.manualTestContainer}>
      {arrange({
        state: value,
        setState: setValue,
        reset: () => {
          if (skip) {
            setResult({
              status: 'skipped',
              message: typeof skip === 'string' ? skip : undefined,
            });
          } else {
            setResult({ status: 'waitingForTester' });
          }
          setIsInitialRun(true);
          setValue(initialState);
          reportTestCaseResult('waitingForTester');
        },
      })}
    </View>
  );

  const renderTestDetails = () => {
    if (
      result.status !== 'broken' &&
      result.status !== 'fail' &&
      result.status !== 'skipped'
    )
      return null;
    return (
      <Text
        style={[
          styles.textDetails,
          { color: result.status === 'skipped' ? PALETTE.yellow : PALETTE.red },
        ]}
      >
        {result.message}
      </Text>
    );
  };

  return (
    <TestCaseStateTemplate
      name={itShould}
      renderStatusLabel={() => {
        const labelInfo = STATUS_LABEL_DATA_BY_TEST_CASE_STATUS[result.status];
        return (
          <Text style={[styles.testCaseStatus, { color: labelInfo.color }]}>
            {labelInfo.label}
          </Text>
        );
      }}
      renderModal={
        modal
          ? () => (
              <>
                {renderTestContent()}
                {renderTestDetails()}
              </>
            )
          : undefined
      }
      renderDetails={
        modal
          ? renderTestDetails
          : () => (
              <>
                {renderTestContent()}
                {renderTestDetails()}
              </>
            )
      }
    />
  );
}

const STATUS_LABEL_DATA_BY_TEST_CASE_STATUS: Record<
  TestCaseState['status'],
  { label: string; color: string }
> = {
  broken: { label: 'BROKEN', color: PALETTE.red },
  fail: { label: 'FAIL', color: PALETTE.red },
  pass: { label: 'PASS', color: PALETTE.green },
  skipped: { label: 'SKIPPED', color: PALETTE.yellow },
  running: { label: 'RUNNING', color: PALETTE.gray },
  waitingForTester: { label: 'MANUAL', color: PALETTE.blue },
};

const styles = StyleSheet.create({
  manualTestContainer: {
    borderWidth: 4,
    borderColor: '#666',
    backgroundColor: 'white',
    marginBottom: 8,
  },
  testCaseStatus: {
    width: 72,
    height: '100%',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#AAA',
  },
  textDetails: {
    width: '100%',
    padding: 2,
    fontSize: 10,
    color: 'white',
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});
