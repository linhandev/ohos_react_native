import { FC, useContext, Children, useState, ReactElement, useEffect, isValidElement} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { TestCaseType, TestSuiteContext } from './TestingContext';
import { TestingContext, Filter } from './TestingContext';
import { TestCaseResultType } from '../core';

function getTestCaseType(props: any) : TestCaseType | null {
  if ('fn' in props) {
    return 'logical'
  }

  if ('act' in props) {
    return 'automated'
  }

  if ('arrange' in props) {
    return 'manual'
  }

  if ('itShould' in props) {
    return 'example'
  }

  return null;
}

function shouldChangeCurrentChild(result: TestCaseResultType, child: any): boolean {
  if (!getTestCaseType(child.props)) { 
    return false;
  }

  if (result !== 'skipped' && result !== 'pass' && result !== 'fail' && result !== 'broken') {
    return false;
  }

  return true;
} 

export const TestSuite: FC<{ name: string; children: any }> = ({
  name,
  children,
}) => {
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const childArray = Children.toArray(children);
  const testingContext = useContext(TestingContext)!;
  const testSuiteContext = useContext(TestSuiteContext);
  const parentTestSuiteId = testSuiteContext?.testSuiteId;
  const depth = testSuiteContext?.depth ?? 0;
  const [showNextTestButton, setShowNextTestButton] = useState(false);
  const pauseOnFailure = typeof testingContext?.isSequential === "object" && testingContext.isSequential.pauseOnFailure;
  const filteredChildren = childArray.filter((child, _) => {
    if (!isValidElement(child)) {
      return false;
    }

    if (child.type === TestSuite) {
      return true;
    }

    const testCaseType = getTestCaseType(child.props);
    if (!testCaseType) {
      return false;
    }

    const shouldIgnore = !testingContext.filter({testCaseType, tags: child.props.tags ?? []})    
    return !shouldIgnore;
  });
  const currentChild = filteredChildren[currentChildIndex]; 

  const changeRenderedTestsIfSequential = () => {
    if (!testingContext.isSequential) {
      return;
    }

    if (currentChildIndex === filteredChildren.length - 1) {
      testingContext?.onTestSuiteComplete();
    }
    else {
      setShowNextTestButton(false);
      setCurrentChildIndex(currentChildIndex + 1);
    }
  }

  const shouldPause = (result: TestCaseResultType) => {
    return pauseOnFailure && result !== 'skipped' && result !== 'pass';
  }

  useEffect(() => {
    if (testingContext.isSequential && filteredChildren.length === 0) {
      testingContext.onTestSuiteComplete();
    }
    
    if (isValidElement(currentChild) && getTestCaseType(currentChild.props) == 'example') {
      setShowNextTestButton(true);
    }
  }, [currentChildIndex])

  return (
    <TestSuiteContext.Provider
      value={{
        testSuiteName: name,
        testSuiteId: `${
          parentTestSuiteId ? `${parentTestSuiteId}::` : ''
        }${name}`,
        depth: depth + 1,
      }}
    >
      <View style={styles.testSuiteContainer}>
        <Text
          style={[
            styles.testSuiteHeader,
            {
              fontSize: depth > 0 ? 12 : 16,
            },
          ]}
        >
          {name}
        </Text>
        <TestingContext.Provider 
          value={{...testingContext, reportTestCaseResult: (testCaseId, result) => {
            const shouldChange = shouldChangeCurrentChild(result, currentChild);
            if (shouldChange && shouldPause(result)) {
              setShowNextTestButton(true);
            }
            else if (shouldChange) {
              changeRenderedTestsIfSequential();
            }
            testingContext?.reportTestCaseResult(testCaseId, result);
          },
          onTestSuiteComplete: () => {
            changeRenderedTestsIfSequential();
          }  
        }}      
      >
        {testingContext?.isSequential
          ? currentChild : filteredChildren} 

        {showNextTestButton && (
          <Button title="Next Test" onPress={changeRenderedTestsIfSequential} />
        )}
        </TestingContext.Provider>
      </View>
    </TestSuiteContext.Provider>
  );
};

const styles = StyleSheet.create({
  testSuiteContainer: {
    padding: 8,
  },
  testSuiteHeader: {
    width: '100%',
    fontWeight: 'bold',
    color: '#EEE',
  },
});
