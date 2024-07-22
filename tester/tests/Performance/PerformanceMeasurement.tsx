import {View} from 'react-native';
import React, {useCallback, useState} from 'react';
import Test0 from './Test0';
import Test1 from './Test1';
import TestPerformer from './TestPerformer';

const timestampFileName = 'test-timestamps.json';
const tests = [Test0, Test1];

export default function PerformanceMeasurement() {
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [timestamps, setTimestamps] = useState<any>([]);

  const onCompleteHandler = useCallback(
    async (data: any) => {
      setTimestamps([...timestamps, data]);
      console.log('Test completed, duration: ', data.duration);

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
          console.error('Failed to write timestamps to file', error);
        }
        return;
      }

      setCurrentTestIndex(currentTestIndex + 1);
    },
    [currentTestIndex, timestamps],
  );

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <TestPerformer
        testComponent={tests[currentTestIndex]}
        onComplete={onCompleteHandler}
      />
    </View>
  );
}
