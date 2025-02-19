import { FC, useCallback, useEffect, useState, Children } from 'react';
import { TestCaseResultType, TestCaseState } from '../core';
import { Filter, TestingContext } from './TestingContext';
import { PALETTE } from './palette';
import { ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';

const defaultTestingSummary: Record<TestCaseResultType | 'total', number> = {
  total: 0,
  pass: 0,
  fail: 0,
  broken: 0,
  example: 0,
  skipped: 0,
  waitingForTester: 0,
};

export const Tester: FC<{
  style?: ViewStyle;
  children: any;
  filter?: Filter;
  sequential?: boolean | { pauseOnFailure: boolean };
}> = ({ children, filter, style, sequential = false }) => {
  const [testCaseResultTypeByTestCaseId, setTestCaseResultTypeByTestCaseId] =
    useState<Record<string, TestCaseResultType | 'unknown'>>({});
  const [testingSummary, setTestingSummary] = useState({
    ...defaultTestingSummary,
  });
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [displaySummaryPage, setDisplaySummaryPage] = useState(false);
  const childArray = Children.toArray(children);

  const registerTestCase = useCallback((testCaseId: string) => {
    setTestCaseResultTypeByTestCaseId((prev) => {
      if (testCaseId in prev) {
        console.warn(`Test ${testCaseId} already exists`);
      }
      return {
        ...prev,
        [testCaseId]: 'unknown',
      };
    });
  }, []);

  const reportTestCaseResult = useCallback(
    (testCaseId: string, result: TestCaseResultType) => {
      setTestCaseResultTypeByTestCaseId((prev) => ({
        ...prev,
        [testCaseId]: result,
      }));
    },
    []
  );

  useEffect(() => {
    const newTestingSummary = { ...defaultTestingSummary };
    for (const [_testCaseId, testCaseResult] of Object.entries(
      testCaseResultTypeByTestCaseId
    )) {
      if (testCaseResult !== 'unknown') {
        newTestingSummary[testCaseResult]++;
      }
      newTestingSummary.total++;
    }
    setTestingSummary(newTestingSummary);
  }, [testCaseResultTypeByTestCaseId]);

  const changeRenderedTestsIfSequential = () => {
    if (sequential && currentChildIndex !== childArray.length - 1) {
      setCurrentChildIndex(currentChildIndex + 1);
    } else if (sequential) {
      setDisplaySummaryPage(true);
    }
  };

  return (
    <TestingContext.Provider
      value={{
        registerTestCase,
        reportTestCaseResult,
        onTestSuiteComplete: changeRenderedTestsIfSequential,
        isSequential: sequential,
        filter: filter ?? (() => true),
      }}
    >
      <View style={StyleSheet.compose(styles.testerContainer, style)}>
        <ScrollView
          horizontal
          style={styles.summaryContainer}
          contentContainerStyle={{ alignItems: 'center', width: '100%' }}
        >
          {!sequential && (
            <>
              <SummaryItem
                name='TOTAL'
                color={'white'}
                value={testingSummary.total}
              />
              <SummaryItem
                name='RUNNING'
                color={PALETTE.red}
                value={
                  testingSummary.total -
                  (testingSummary.pass +
                    testingSummary.fail +
                    testingSummary.waitingForTester +
                    testingSummary.example +
                    testingSummary.broken +
                    testingSummary.skipped)
                }
              />
            </>
          )}
          <SummaryItem
            name='PASS'
            color={PALETTE.green}
            value={testingSummary.pass}
          />
          <SummaryItem
            name='WAITING'
            color={PALETTE.blue}
            value={testingSummary.waitingForTester}
          />
          <SummaryItem
            name='SKIPPED'
            color={PALETTE.yellow}
            value={testingSummary.skipped}
          />
          <SummaryItem
            name='FAIL'
            color={PALETTE.red}
            value={testingSummary.fail}
          />
          <SummaryItem
            name='BROKEN'
            color={PALETTE.red}
            value={testingSummary.broken}
          />
          <SummaryItem
            name='EXAMPLES'
            color={PALETTE.gray}
            value={testingSummary.example}
          />
        </ScrollView>
        {!sequential ? (
          children
        ) : displaySummaryPage ? (
          <SummaryPage testCases={testCaseResultTypeByTestCaseId} />
        ) : (
          childArray[currentChildIndex]
        )}
      </View>
    </TestingContext.Provider>
  );
};

const SummaryItem: FC<{
  name: string;
  color: string;
  value: number;
  onPress?: () => {};
}> = ({ name, color, value, onPress }) => {
  return (
    <View style={styles.summaryItemContainer} onTouchEnd={() => onPress?.()}>
      <Text
        testID={'TESTERINO_' + name + '_VALUE'}
        style={[
          styles.summaryItemValue,
          { color: value > 0 ? color : PALETTE.gray },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={styles.summaryItemName}>{name}</Text>
    </View>
  );
};

const SummaryPage: FC<{
  testCases: Record<string, TestCaseResultType | 'unknown'>;
}> = ({ testCases }) => {
  return (
    <ScrollView>
      {Object.entries(testCases).map(([name, result]) => (
        <SingleTestSummary key={name} name={name} status={result} />
      ))}
    </ScrollView>
  );
};

const SingleTestSummary: FC<{
  name: string;
  status: TestCaseResultType | 'unknown';
}> = ({ name, status }) => {
  const labelInfo = STATUS_LABEL_DATA_BY_TEST_RESULT[status];
  return (
    <View style={styles.testCaseHeaderContainer}>
      <Text style={styles.testCaseHeader}>{name}</Text>
      <Text style={[styles.testCaseStatus, { color: labelInfo.color }]}>
        {status}
      </Text>
    </View>
  );
};

const STATUS_LABEL_DATA_BY_TEST_RESULT: Record<
  TestCaseResultType | 'unknown',
  { label: string; color: string }
> = {
  broken: { label: 'BROKEN', color: PALETTE.red },
  fail: { label: 'FAIL', color: PALETTE.red },
  pass: { label: 'PASS', color: PALETTE.green },
  skipped: { label: 'SKIPPED', color: PALETTE.yellow },
  waitingForTester: { label: 'WAITING', color: PALETTE.blue },
  unknown: { label: 'UNKNOWN', color: PALETTE.gray },
  example: { label: 'EXAMPLE', color: PALETTE.blue },
};

const styles = StyleSheet.create({
  testerContainer: {
    backgroundColor: '#222',
    paddingHorizontal: 8,
  },
  summaryContainer: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 8,
    flexGrow: 0,
    paddingBottom: 4,
  },
  summaryItemContainer: {
    flex: 1,
    paddingHorizontal: 1,
  },
  summaryItemValue: {
    color: 'white',
    fontSize: 20,
    width: '100%',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  summaryItemName: {
    color: PALETTE.gray,
    width: '100%',
    fontSize: 7,
    textAlign: 'center',
  },
  testCaseStatus: {
    width: 72,
    height: '100%',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#AAA',
  },
  testCaseHeaderContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#666',
  },
  testCaseHeader: {
    flex: 1,
    height: '100%',
    fontSize: 12,
    color: '#EEE',
  },
});
