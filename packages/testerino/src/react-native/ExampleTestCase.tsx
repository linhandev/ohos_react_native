import { FC, useContext, useEffect } from 'react';
import { TestCaseContext } from './TestingContext';
import { StyleSheet, Text, View } from 'react-native';
import { PALETTE } from './palette';
import { TestCaseStateTemplate } from './TestCaseStateTemplate';

export type ExampleTestCaseProps = {
  itShould: string;
  children: any;
  skip?: boolean | string;
  modal?: boolean;
};

export const ExampleTestCase: FC<ExampleTestCaseProps> = ({
  itShould: name,
  children,
  skip,
  modal,
}) => {
  const { reportTestCaseResult } = useContext(TestCaseContext)!;

  useEffect(() => {
    reportTestCaseResult(skip ? 'skipped' : 'example');
  }, []);

  const renderExample = () => {
    return (
      <>
        <View style={styles.exampleTestContainer}>{children}</View>
        {typeof skip === 'string' && (
          <Text style={[styles.textDetails, { color: PALETTE.yellow }]}>
            {skip}
          </Text>
        )}
      </>
    );
  };

  return (
    <TestCaseStateTemplate
      name={name}
      renderStatusLabel={() => (
        <Text
          style={[
            styles.testCaseStatus,
            { color: skip ? PALETTE.yellow : PALETTE.gray },
          ]}
        >
          {skip ? 'SKIPPED' : 'EXAMPLE'}
        </Text>
      )}
      renderDetails={modal ? undefined : renderExample}
      renderModal={modal ? renderExample : undefined}
    />
  );
};

const styles = StyleSheet.create({
  exampleTestContainer: {
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
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});
