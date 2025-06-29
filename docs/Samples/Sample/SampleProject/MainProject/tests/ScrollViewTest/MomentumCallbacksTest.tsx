/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE-MIT file in the root directory of this source tree.
 */

import { TestCase } from '@rnoh/testerino';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button } from '../../components';

export function MomentumCallbacksTest() {
  return (
    <TestCase
      modal
      itShould="display amount of on drag/momentum begin/end events">
      <MomentumTestCase />
    </TestCase>
  );
}

function MomentumTestCase() {
  const [hasDragBegan, setHasDragBegan] = useState(0);
  const [hasDragEnded, setHasDragEnded] = useState(0);
  const [hasMomentumBegan, setHasMomentumBegan] = useState(0);
  const [hasMomentumEnded, setHasMomentumEnded] = useState(0);

  return (
    <>
      <Button
        label="Reset"
        onPress={() => {
          setHasDragBegan(0);
          setHasDragEnded(0);
          setHasMomentumBegan(0);
          setHasMomentumEnded(0);
        }}
      />
      <View style={{ backgroundColor: 'white', width: '100%' }}>
        <Text style={{ height: 16 }}>hasMomentumBegan: {hasMomentumBegan}</Text>
        <Text style={{ height: 16 }}>hasMomentumEnded: {hasMomentumEnded}</Text>
        <Text style={{ height: 16 }}>hasDragBegan: {hasDragBegan}</Text>
        <Text style={{ height: 16 }}>hasDragEnded: {hasDragEnded}</Text>
      </View>

      <View style={{ width: 200, height: 200 }}>
        <ScrollView
          onScrollBeginDrag={() => {
            setHasDragBegan(p => p + 1);
          }}
          onScrollEndDrag={() => {
            setHasDragEnded(p => p + 1);
          }}
          onMomentumScrollBegin={() => {
            setHasMomentumBegan(p => p + 1);
          }}
          onMomentumScrollEnd={() => {
            setHasMomentumEnded(p => p + 1);
          }}>
          <View style={{ backgroundColor: 'red', width: '100%', height: 150 }} />
          <View style={{ backgroundColor: 'blue', width: '100%', height: 150 }} />
          <View
            style={{ backgroundColor: 'green', width: '100%', height: 150 }}
          />
          <View style={{ backgroundColor: 'red', width: '100%', height: 150 }} />
        </ScrollView>
      </View>
    </>
  );
}
