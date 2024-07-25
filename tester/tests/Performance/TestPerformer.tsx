import React, {useRef, useState} from 'react';

export type TestCaseProps = {
  onStart: () => void;
  onComplete: () => void;
};

type TestPerformerProps = {
  onComplete: (data: {
    testName: string;
    startTimestamp: number;
    endTimestamp: number;
    duration: number;
  }) => void;
  testComponent: React.ComponentType<TestCaseProps>;
};

export default function TestPerformer({
  onComplete,
  testComponent: Test,
}: TestPerformerProps) {
  const [initialMount, setInitialMount] = useState(true);
  const startTimestamp = useRef<number>(0);

  // Method for overwriting the start timestamp
  const onStartHandler = () => {
    startTimestamp.current = Date.now();
  };

  const onCompleteHandler = () => {
    const endTimestamp = Date.now();
    onComplete({
      testName: Test.name,
      startTimestamp: startTimestamp.current,
      endTimestamp,
      duration: endTimestamp - startTimestamp.current,
    });
    setInitialMount(true);
  };

  if (initialMount) {
    setInitialMount(false);
    startTimestamp.current = Date.now();
    return null;
  }

  return <Test onStart={onStartHandler} onComplete={onCompleteHandler} />;
}
