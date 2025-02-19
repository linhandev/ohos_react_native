import { FC, useContext, useEffect, useState } from 'react';
import { TestCaseState } from '../core';
import { expect as expect_, AssertionError } from 'chai';
import { TestCaseContext } from './TestingContext';
import { TestCaseStateComponent } from './TestCaseState';

export const LogicalTestCase: FC<{
  name: string;
  skip?: boolean | string;
  fn: (utils: { expect: typeof expect_ }) => Promise<void> | void;
}> = ({ name, fn, skip }) => {
  const [result, setResult] = useState<TestCaseState>({ status: 'running' });
  const { reportTestCaseResult } = useContext(TestCaseContext)!;

  useEffect(() => {
    (async () => {
      try {
        if (skip) {
          setResult({
            status: 'skipped',
            message: typeof skip === 'string' ? skip : undefined,
          });
          reportTestCaseResult('skipped');
          return;
        }
        setResult({ status: 'running' });
        await fn({ expect: expect_ });
        setResult({ status: 'pass' });
        reportTestCaseResult('pass');
      } catch (err) {
        if (err instanceof AssertionError) {
          setResult({ status: 'fail', message: err.message });
          reportTestCaseResult('fail');
        } else if (err instanceof Error) {
          setResult({ status: 'broken', message: err.message });
          reportTestCaseResult('broken');
        } else {
          setResult({ status: 'broken', message: '' });
          reportTestCaseResult('broken');
        }
      }
    })();
  }, []);

  return <TestCaseStateComponent name={name} result={result} />;
};
