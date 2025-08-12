/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { SafeAreaView, Text, StatusBar, View, CheckBox } from 'react-native';
// import View from 'react-native/Libraries/Components/View/View';

const App = () => {
  return (
    <View>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <View style={{ padding: 24 }}>
          <CheckBox style={{width: 64, height: 64, backgroundColor: "red"}} value={true} onValueChange={() => { }} />
          <Text style={{ fontSize: 24 }}>TODO</Text>
          <Text>
            ✅ - switch to TypeScript and test it in the legacy project after
            validating Android build
          </Text>
          <Text>- copy simple navigation simple from tester project</Text>
          <Text>- integrate testerino and custom components from tester</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default App;
