import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {View, Text, LogBox} from 'react-native';
import {TestCaseProps} from '../TestPerformer';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createStackNavigator();

function FirstScreen({navigation, route}: any) {
  useEffect(() => {
    route.params?.onStart();
    navigation.navigate('SecondScreen');
  });

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>First Screen</Text>
    </View>
  );
}

function SecondScreen({route}: any) {
  useEffect(() => {
    route.params?.onComplete();
  });

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Second Screen</Text>
    </View>
  );
}

export function StackNavigatorNavigateAction(props: TestCaseProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="FirstScreen"
          component={FirstScreen}
          initialParams={props}
        />
        <Stack.Screen
          name="SecondScreen"
          component={SecondScreen}
          initialParams={props}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
