import {BackHandler, Text, TouchableOpacity, View} from 'react-native';
import {TestSuite} from '@rnoh/testerino';
import {useCallback, useState} from 'react';
import {Button, StateKeeper, TestCase} from '../components';
import React from 'react';
import {useEnvironment} from '../contexts';

export const BackHandlerTest = () => {
  const [counter, setCounter] = useState(0);

  const {
    env: {driver},
  } = useEnvironment();

  const handleBackPress = useCallback(() => {
    setCounter(prev => prev + 1);
    return true;
  }, []);
  return (
    <TestSuite name="BackHandler">
      <TestCase.Logical
        itShould="be exported"
        fn={({expect}) => {
          expect(BackHandler).to.be.not.undefined;
        }}
      />
      <TestCase.Example itShould="exit app on press">
        <TouchableOpacity
          style={{height: 64}}
          onPress={() => {
            BackHandler.exitApp();
          }}>
          <Text style={{width: '100%', height: '100%'}}>Exit</Text>
        </TouchableOpacity>
      </TestCase.Example>
      <TestCase.Logical
        tags={['sequential']}
        itShould="handle back press event"
        fn={async ({expect}) => {
          const result = await new Promise<boolean>(async (resolve, reject) => {
            const listener = BackHandler.addEventListener(
              'hardwareBackPress',
              () => {
                listener.remove();
                resolve(true);
                return true;
              },
            );
            setTimeout(() => {
              listener.remove();
              reject(
                new Error('Back press event was not received within 500 ms'),
              );
            }, 500);

            await driver?.keyEvent().back().send();
          });

          expect(result).to.be.true;
        }}
      />
      <TestCase.Example itShould="allow to add, remove eventListener and display number of system back presses/gestures accordingly">
        <StateKeeper<ReturnType<BackHandler['addEventListener']> | undefined>
          initialValue={undefined}
          renderContent={(sub, setSub) => {
            return (
              <React.Fragment>
                <Text style={{width: '100%'}}>
                  Back pressed {counter} time{counter === 1 ? '' : 's'}
                </Text>
                <View style={{flexDirection: 'row'}}>
                  <Button
                    label={'Add event listener'}
                    onPress={() => {
                      setSub(
                        BackHandler.addEventListener(
                          'hardwareBackPress',
                          handleBackPress,
                        ),
                      );
                    }}
                  />
                  <Button
                    label={'Remove event listener'}
                    onPress={() => {
                      sub?.remove();
                    }}
                  />
                </View>
              </React.Fragment>
            );
          }}
        />
      </TestCase.Example>
    </TestSuite>
  );
};
