import React, {useCallback, useState} from 'react';
import * as testComponents from './tests';
import TestPerformer from './TestPerformer';
import NextTestScreen from './NextTestScreen';

const timestampFileName = 'test-timestamps.json';

const tests = Object.values(testComponents).flatMap((element, index, array) =>
  index < array.length - 1 ? [element, NextTestScreen] : [element],
);

export default function PerformanceMeasurement() {
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [timestamps, setTimestamps] = useState<any>([]);

  const onCompleteHandler = useCallback(
    async (data: any) => {
      if (data.testName === 'NextTestScreen') {
        setCurrentTestIndex(currentTestIndex + 1);
        return;
      }
      setTimestamps([...timestamps, data]);
      console.log(
        `Test ${data.testName} completed, duration: ${(data.duration / 1000).toFixed(2)}s`,
      );
      if (currentTestIndex === tests.length - 1) {
        try {
          // @ts-ignore
          const FS = await import('react-native-fs');
          const timestampFilePath = `${FS.TemporaryDirectoryPath}/${timestampFileName}`;
          await FS.writeFile(
            timestampFilePath,
            JSON.stringify([...timestamps, data]),
          );
          console.log('All tests completed!');
        } catch (error) {
          console.error('Failed to write timestamps to file ', error);
        }
        return;
      }

      setCurrentTestIndex(currentTestIndex + 1);
    },
    [currentTestIndex, timestamps],
  );

  return (
    <TestPerformer
      testComponent={tests[currentTestIndex]}
      onComplete={onCompleteHandler}
    />
  );
}
