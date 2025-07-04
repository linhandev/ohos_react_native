import {LogicalTestCase, TestCase as _TestCase} from '@rnoh/testerino';
import {SmartManualTestCaseProps} from '@rnoh/testerino/src/react-native/ManualTestCase';
import {SmartAutomatedTestCaseProps} from '@rnoh/testerino/src/react-native/AutomatedTestCase';
import React from 'react';
import {Platform} from 'react-native';

export const TestCase = {
  Example: Example,
  Manual: Manual,
  Logical: Logical,
  Automated: Automated,
};

type TesterTag = 'dev';

type SupportedTags = TesterTag | 'sequential';

type TesterHarmonySkipProp =
  | boolean
  | string
  | {
      arkTs: string | boolean;
      cAPI: string | boolean;
    };

type TesterSkipProp =
  | {
      android: string | boolean;
      harmony: TesterHarmonySkipProp;
    }
  | string;

function prepareSkipProp(skipProp: TesterSkipProp | undefined) {
  return skipProp
    ? typeof skipProp === 'string'
      ? skipProp
      : Platform.select({
          android: skipProp?.android,
          harmony: prepareHarmonySkipProp(skipProp?.harmony),
        })
    : undefined;
}

function prepareHarmonySkipProp(
  skipProp: TesterHarmonySkipProp,
): string | boolean {
  if (typeof skipProp === 'string' || typeof skipProp === 'boolean') {
    return skipProp;
  } else {
    return 'rnohArchitecture' in Platform.constants &&
      Platform.constants.rnohArchitecture === 'C_API'
      ? skipProp?.cAPI
      : skipProp?.arkTs;
  }
}

export function Example({
  itShould,
  children,
  skip,
  tags,
  modal,
}: {
  itShould: string;
  children: any;
  modal?: boolean;
  skip?: TesterSkipProp;
  tags?: SupportedTags[];
}) {
  return (
    <_TestCase
      itShould={itShould}
      modal={modal}
      tags={tags}
      skip={prepareSkipProp(skip)}>
      {children}
    </_TestCase>
  );
}

export function Manual<TState = undefined>({
  itShould,
  skip,
  tags,
  modal,
  initialState,
  arrange,
  assert,
}: {
  itShould: string;
  skip?: TesterSkipProp;
  tags?: SupportedTags[];
  modal?: boolean;
  initialState: TState;
  arrange: SmartManualTestCaseProps<TState>['arrange'];
  assert: SmartManualTestCaseProps<TState>['assert'];
}) {
  return (
    <_TestCase
      itShould={itShould}
      modal={modal}
      tags={tags}
      skip={prepareSkipProp(skip)}
      initialState={initialState}
      arrange={arrange}
      assert={assert}
    />
  );
}

export function Logical({
  itShould,
  skip,
  tags,
  fn,
}: {
  itShould: string;
  skip?: TesterSkipProp;
  tags?: SupportedTags[];
  fn: React.ComponentProps<typeof LogicalTestCase>['fn'];
}) {
  return (
    <_TestCase
      itShould={itShould}
      skip={prepareSkipProp(skip)}
      tags={tags}
      fn={fn}
    />
  );
}

export function Automated<TState = undefined>({
  itShould,
  skip,
  tags,
  modal,
  initialState,
  arrange,
  act,
  assert,
}: {
  itShould: string;
  skip?: TesterSkipProp;
  tags?: SupportedTags[];
  modal?: boolean;
  initialState: TState;
  arrange: SmartAutomatedTestCaseProps<TState>['arrange'];
  act: SmartAutomatedTestCaseProps<TState>['act'];
  assert: SmartAutomatedTestCaseProps<TState>['assert'];
}) {
  return (
    <_TestCase
      itShould={itShould}
      modal={modal}
      tags={tags}
      skip={prepareSkipProp(skip)}
      initialState={initialState}
      arrange={arrange}
      act={act}
      assert={assert}
    />
  );
}
