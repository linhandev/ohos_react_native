import React, {useEffect} from 'react';
import {NavigationContainer, useIsFocused} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {View, Text, LogBox} from 'react-native';
import {TestCaseProps} from '../TestPerformer';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createStackNavigator();

function FirstScreen({navigation, route}: any) {
  const isFocused = useIsFocused();
  const [hasBeenUnfocused, setHasBeenUnfocused] = React.useState(false);

  useEffect(() => {
    if (hasBeenUnfocused) {
      route.params?.onComplete();
      return;
    }
    if (!isFocused) {
      setHasBeenUnfocused(true);
    }
  }, [isFocused]);

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

function SecondScreen({navigation, route}: any) {
  useEffect(() => {
    route.params?.onStart();
    navigation.goBack();
  });

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Second Screen</Text>
    </View>
  );
}

export function StackNavigatorGoBackAction(props: TestCaseProps) {
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
