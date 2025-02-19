import { createContext } from 'react';
import { TestCaseResultType } from '../core';

export type TestCaseType = 'automated' | 'manual' | 'example' | 'logical';
export type Filter = (testCaseCtx: {testCaseType: TestCaseType; tags: string[]}) => boolean; 

export const TestingContext = createContext<
  | undefined
  | {
      registerTestCase: (testCaseId: string) => void;
      reportTestCaseResult: (
        testCaseId: string,
        result: TestCaseResultType
      ) => void;
      onTestSuiteComplete: () => void;
      isSequential: boolean | {pauseOnFailure: boolean};
      filter: Filter;
    }
>(undefined);

export const TestSuiteContext = createContext<
  undefined | { testSuiteName: string; testSuiteId: string; depth: number } 
>(undefined);

export const TestCaseContext = createContext<
  undefined | { reportTestCaseResult: (result: TestCaseResultType) => void }
>(undefined);
