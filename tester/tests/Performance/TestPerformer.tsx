import React, {useState} from 'react';

export type TestCaseProps = {
  onComplete: () => void;
};

type TestPerformerProps = {
  onComplete: (data: {
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
  const [startTimestamp, setStartTimestamp] = useState(0);

  if (initialMount) {
    setInitialMount(false);
    setStartTimestamp(Date.now());
    return null;
  }

  return (
    <Test
      onComplete={() => {
        const endTimestamp = Date.now();
        onComplete({
          startTimestamp,
          endTimestamp,
          duration: endTimestamp - startTimestamp,
        });
        setInitialMount(true);
      }}
    />
  );
}
