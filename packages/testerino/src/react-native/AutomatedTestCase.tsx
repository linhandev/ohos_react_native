import {useContext, useEffect, useState} from 'react';
import {TestCaseState} from '../core';
import {TestCaseContext} from './TestingContext';
import {AssertionError, expect as expect_} from 'chai';
import {TestCaseStateTemplate} from './TestCaseStateTemplate';
import {PALETTE} from './palette';
import {StyleSheet, Text, View} from 'react-native';

export type SmartAutomatedTestCaseProps<TState> = {
  initialState: TState;
  itShould: string;
  skip?: boolean | string;
  modal?: boolean;
  arrange: (ctx: {
    state: TState;
    setState: React.Dispatch<React.SetStateAction<TState>>;
    reset: () => void;
    done: () => void;
  }) => JSX.Element;
  act: (ctx: {state: TState; done: () => void}) => void;
  assert: (utils: {
    expect: typeof expect_;
    state: TState;
  }) => Promise<void> | void;
};

export function AutomatedTestCase<TState>({
  initialState,
  itShould,
  skip,
  modal,
  arrange,
  act,
  assert,
}: SmartAutomatedTestCaseProps<TState>) {
  const [value, setValue] = useState(initialState);
  const [isDone, setIsDone] = useState(false);
  const [result, setResult] = useState<TestCaseState>(
    skip
      ? {
          status: 'skipped',
          message: typeof skip === 'string' ? skip : undefined,
        }
      : {status: 'waitingForTester'},
  );
  const {reportTestCaseResult} = useContext(TestCaseContext)!;

  const handleTestCaseDone = async () => {
    try {
      await assert({expect: expect_, state: value});
      setResult({status: 'pass'});
      reportTestCaseResult('pass');
    } catch (err) {
      if (err instanceof AssertionError) {
        setResult({status: 'fail', message: err.message});
        reportTestCaseResult('fail');
      } else if (err instanceof Error) {
        setResult({status: 'broken', message: err.message});
        reportTestCaseResult('broken');
      } else {
        setResult({status: 'broken', message: ''});
        reportTestCaseResult('broken');
      }
    }
  };

  useEffect(() => {
    if (skip) {
      reportTestCaseResult('skipped');
      return;
    }

    if (isDone) {
      handleTestCaseDone();
    } else {
      reportTestCaseResult('waitingForTester');
      setResult({status: 'running'});
      act({done: () => setIsDone(true), state: value});
    }
  }, [isDone]);

  const renderTestContent = () => (
    <View style={styles.testContainer}>
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
            setResult({status: 'waitingForTester'});
          }
          setValue(initialState);
          reportTestCaseResult('waitingForTester');
        },
        done: () => setIsDone(true),
      })}
    </View>
  );

  const renderTestDetails = () => {
    if (
      result.status !== 'broken' &&
      result.status !== 'fail' &&
      result.status !== 'skipped'
    ) {
      return null;
    }
    return (
      <Text
        style={[
          styles.textDetails,
          {color: result.status === 'skipped' ? PALETTE.yellow : PALETTE.red},
        ]}>
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
          <Text style={[styles.testCaseStatus, {color: labelInfo.color}]}>
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
  {label: string; color: string}
> = {
  broken: {label: 'BROKEN', color: PALETTE.red},
  fail: {label: 'FAIL', color: PALETTE.red},
  pass: {label: 'PASS', color: PALETTE.green},
  skipped: {label: 'SKIPPED', color: PALETTE.yellow},
  running: {label: 'RUNNING', color: PALETTE.gray},
  waitingForTester: {label: 'WAITING', color: PALETTE.blue},
};

const styles = StyleSheet.create({
  testContainer: {
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
