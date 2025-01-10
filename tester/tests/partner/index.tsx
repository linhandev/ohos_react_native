// Test cases for some reference situations
import React, {useState, useEffect} from 'react';
import {View, Text, Button, DeviceEventEmitter, ViewPropTypes} from 'react-native';
// test DeprecatedStyleSheetPropType
import StylesheetPropType from 'react-native/Libraries/DeprecatedPropTypes/DeprecatedStyleSheetPropType';
console.log('StylesheetPropType666: ', StylesheetPropType);
// test DeprecatedViewPropTypes
import ViewStylePropTypes from 'react-native/Libraries/DeprecatedPropTypes/DeprecatedViewPropTypes';
console.log('ViewStylePropTypes7777: ', ViewStylePropTypes);
// test ViewPropTypes in react-native,not in deprecated-react-native-prop-types
// import {ViewPropTypes} from 'deprecated-react-native-prop-types';
console.log('ViewPropTypes: ', ViewPropTypes);

export function LeadInTest() {

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>{'No problem'}</Text>
    </View>
  );
}
