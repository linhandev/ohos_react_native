/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {TestSuite} from '@rnoh/testerino';
import {Text, View} from 'react-native';
// @ts-ignore
import {ActionSheetIOS} from 'react-native';
import {TestCase, Button, StateKeeper} from '../components';

const BUTTONS = [
  'Option 0',
  'Option 1',
  'Option 2',
  'Delete',
  'Cancel',
] as const;
const DESTRUCTIVE_INDEX = 3;
const CANCEL_INDEX = 4;

export function ActionSheetIOSTest() {
  return (
    <TestSuite name="ActionSheetIOS">
      <TestSuite name="showActionSheetWithOptions">
        <TestCase.Example itShould="show Action Sheet">
          <StateKeeper<undefined | string>
            initialValue={undefined}
            renderContent={(value, setValue) => {
              return (
                <View style={{padding: 32}}>
                  <Text>Clicked button: {value ?? 'undefined'}</Text>
                  <Button
                    label="Show the ActionSheet"
                    onPress={() => {
                      ActionSheetIOS.showActionSheetWithOptions(
                        {
                          title: 'Title',
                          message: 'Message',
                          options: BUTTONS,
                          cancelButtonIndex: CANCEL_INDEX,
                          destructiveButtonIndex: DESTRUCTIVE_INDEX,
                        },
                        (buttonIndex: number) => {
                          setValue(BUTTONS[buttonIndex]);
                        },
                      );
                    }}
                  />
                </View>
              );
            }}
          />
        </TestCase.Example>
      </TestSuite>
    </TestSuite>
  );
}
