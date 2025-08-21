/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {SafeAreaView, Text, StatusBar, View} from 'react-native';
import {Environment} from './contexts';
import {NavigationContainer, Page} from './components';

const App = () => {
  return (
    <Environment>
      <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
        <View>
          <Text style={{fontSize: 24, color: 'white'}}>TODO</Text>
          <Text style={{color: 'white'}}>
            ✅ - switch to TypeScript and test it in the legacy project after
            validating Android build
          </Text>
          <Text style={{color: 'white'}}>
            ✅ - copy simple navigation from tester project
          </Text>
          <Text style={{color: 'white'}}>
            - integrate testerino and custom components from tester
          </Text>
        </View>

        <View style={{flex: 1}}>
          <NavigationContainer>
            <Page name="Test Section w/o test">
              <View></View>
            </Page>
          </NavigationContainer>
        </View>
      </SafeAreaView>
    </Environment>
  );
};

export default App;
