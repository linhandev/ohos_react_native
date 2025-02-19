export type TestCaseResultType =
  | 'pass'
  | 'fail'
  | 'broken'
  | 'example'
  | 'skipped'
  | 'waitingForTester';

export type RunningTestCaseState = {
  status: 'running';
};

export type PassTestCaseState = {
  status: 'pass';
};

export type FailTestCaseState = {
  status: 'fail';
  message: string;
};

export type BrokenTestCaseState = {
  status: 'broken';
  message: string;
};

export type SkippedTestCaseState = {
  status: 'skipped';
  message: string | undefined;
};

export type waitingForTesterTestCaseState = {
  status: 'waitingForTester';
};

export type TestCaseState =
  | RunningTestCaseState
  | PassTestCaseState
  | FailTestCaseState
  | BrokenTestCaseState
  | SkippedTestCaseState
  | waitingForTesterTestCaseState;
