import { FC } from 'react';
import {
  BrokenTestCaseState,
  FailTestCaseState,
  SkippedTestCaseState,
  TestCaseState,
} from '../core';
import { TestCaseStateTemplate } from './TestCaseStateTemplate';
import { StyleSheet, Text } from 'react-native';
import { PALETTE } from './palette';

export const TestCaseStateComponent: FC<{
  name: string;
  result: TestCaseState;
}> = ({ name, result }) => {
  if (result.status === 'broken') {
    return <BrokenTestCaseStateComponent name={name} result={result} />;
  } else if (result.status === 'pass') {
    return <PassTestCaseStateComponent name={name} />;
  } else if (result.status === 'fail') {
    return <FailTestCaseStateComponent name={name} result={result} />;
  } else if (result.status === 'running') {
    return <RunningTestCaseStateComponent name={name} />;
  } else if (result.status === 'skipped') {
    return <SkippedTestCaseStateComponent name={name} result={result} />;
  } else {
    return (
      <BrokenTestCaseStateComponent
        name={name}
        result={{ status: 'broken', message: 'Unknown status' }}
      />
    );
  }
};

const PassTestCaseStateComponent: FC<{
  name: string;
}> = ({ name }) => {
  return (
    <TestCaseStateTemplate
      name={name}
      renderStatusLabel={() => (
        <Text style={[styles.testCaseStatus, { color: PALETTE.green }]}>
          {'PASS'}
        </Text>
      )}
    />
  );
};

const FailTestCaseStateComponent: FC<{
  name: string;
  result: FailTestCaseState;
}> = ({ name, result }) => {
  return (
    <TestCaseStateTemplate
      name={name}
      renderStatusLabel={() => (
        <Text style={[styles.testCaseStatus, { color: PALETTE.red }]}>
          {'FAIL'}
        </Text>
      )}
      renderDetails={() => (
        <Text style={[styles.textDetails, { color: PALETTE.red }]}>
          {result.message}
        </Text>
      )}
    />
  );
};

const BrokenTestCaseStateComponent: FC<{
  name: string;
  result: BrokenTestCaseState;
}> = ({ name, result }) => {
  return (
    <TestCaseStateTemplate
      name={name}
      renderStatusLabel={() => (
        <Text style={[styles.testCaseStatus, { color: PALETTE.red }]}>
          {'BROKEN'}
        </Text>
      )}
      renderDetails={() => (
        <Text style={[styles.textDetails, { color: PALETTE.red }]}>
          {result.message}
        </Text>
      )}
    />
  );
};

const RunningTestCaseStateComponent: FC<{
  name: string;
}> = ({ name }) => {
  return (
    <TestCaseStateTemplate
      name={name}
      renderStatusLabel={() => (
        <Text style={styles.testCaseStatus}>{'RUNNING...'}</Text>
      )}
    />
  );
};

const SkippedTestCaseStateComponent: FC<{
  name: string;
  result: SkippedTestCaseState;
}> = ({ name, result }) => {
  return (
    <TestCaseStateTemplate
      name={name}
      renderStatusLabel={() => (
        <Text style={[styles.testCaseStatus, { color: PALETTE.yellow }]}>
          {'SKIPPED'}
        </Text>
      )}
      renderDetails={
        !result.message
          ? undefined
          : () => (
              <Text style={[styles.textDetails, { color: PALETTE.yellow }]}>
                {result.message}
              </Text>
            )
      }
    />
  );
};

const styles = StyleSheet.create({
  textDetails: {
    width: '100%',
    padding: 2,
    fontSize: 10,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  testCaseStatus: {
    width: 72,
    height: '100%',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#AAA',
  },
});
