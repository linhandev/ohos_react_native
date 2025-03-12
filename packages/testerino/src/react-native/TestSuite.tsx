import {
  FC,
  useContext,
  Children,
  useState,
  useEffect,
  isValidElement,
} from 'react';
import {StyleSheet, Text, View, Button} from 'react-native';
import {TestSuiteContext} from './TestingContext';
import {TestingContext} from './TestingContext';
import {TestCaseResultType} from '../core';
import {getTestCaseTypeFromProps} from './TestCase';

function shouldChangeCurrentChild(
  result: TestCaseResultType,
  child: any,
): boolean {
  if (!getTestCaseTypeFromProps(child.props)) {
    return false;
  }

  if (
    result !== 'skipped' &&
    result !== 'pass' &&
    result !== 'fail' &&
    result !== 'broken'
  ) {
    return false;
  }

  return true;
}

export const TestSuite: FC<{name: string; children: any}> = ({
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
  const pauseOnFailure =
    typeof testingContext?.isSequential === 'object' &&
    testingContext.isSequential.pauseOnFailure;

  const filteredChildren = childArray.filter((child, _) => {
    if (!isValidElement(child)) {
      return false;
    }
    const testCaseType = getTestCaseTypeFromProps(child.props);

    if (testCaseType === null) {
      return true;
    }
    const shouldRender = testingContext.filter({
      testCaseType,
      tags: child.props.tags ?? [],
    });
    return shouldRender;
  });
  const currentChild = filteredChildren[currentChildIndex];

  const changeRenderedTestsIfSequential = () => {
    if (!testingContext.isSequential) {
      return;
    }
    if (currentChildIndex === filteredChildren.length - 1) {
      testingContext?.onTestSuiteComplete();
    } else {
      setShowNextTestButton(false);
      setCurrentChildIndex(currentChildIndex + 1);
    }
  };

  const shouldPause = (result: TestCaseResultType) => {
    return pauseOnFailure && result !== 'skipped' && result !== 'pass';
  };

  useEffect(() => {
    if (testingContext.isSequential && filteredChildren.length === 0) {
      testingContext.onTestSuiteComplete();
    }

    if (
      isValidElement(currentChild) &&
      getTestCaseTypeFromProps(currentChild.props) === 'example'
    ) {
      setShowNextTestButton(true);
    }
  }, [currentChildIndex]);

  if (!testingContext) {
    return null;
  }

  return (
    <TestSuiteContext.Provider
      value={{
        testSuiteName: name,
        testSuiteId: `${
          parentTestSuiteId ? `${parentTestSuiteId}::` : ''
        }${name}`,
        depth: depth + 1,
        onTestCaseIgnored: () => {
          changeRenderedTestsIfSequential();
        },
      }}>
      <View style={styles.testSuiteContainer}>
        <Text
          style={[
            styles.testSuiteHeader,
            {
              fontSize: depth > 0 ? 12 : 16,
            },
          ]}>
          {name}
        </Text>
        <TestingContext.Provider
          value={{
            ...testingContext,
            reportTestCaseResult: (testCaseId, result) => {
              const shouldChange = shouldChangeCurrentChild(
                result,
                currentChild,
              );
              if (shouldChange && shouldPause(result)) {
                setShowNextTestButton(true);
              } else if (shouldChange) {
                changeRenderedTestsIfSequential();
              }
              testingContext?.reportTestCaseResult(testCaseId, result);
            },
            onTestSuiteComplete: () => {
              changeRenderedTestsIfSequential();
            },
          }}>
          {testingContext.isSequential && (
            <>
              {currentChild}
              {showNextTestButton && (
                <Button
                  title="Next Test"
                  onPress={changeRenderedTestsIfSequential}
                />
              )}
            </>
          )}
          {!testingContext.isSequential && filteredChildren}
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
