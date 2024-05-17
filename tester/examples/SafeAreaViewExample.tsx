import {useState} from 'react';
import {SafeAreaView, StatusBar, Text, View} from 'react-native';
import {Button} from '../components';

export function SafeAreaViewExample() {
  const [isStatusBarHidden, setIsStatusBarHidden] = useState(false);

  return (
    <>
      <StatusBar hidden={isStatusBarHidden} />
      <SafeAreaView
        style={{
          paddingTop: 300,
          backgroundColor: 'red',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        collapsable={false}>
        <View
          style={{
            backgroundColor: 'purple',
            width: 250,
            height: 250,
            flex: 1,
            alignItems: 'center',
          }}
          collapsable={false}>
          <View
            style={{backgroundColor: 'green', width: 150, height: 150}}
            collapsable={false}>
            <Button
              onPress={() => {
                setIsStatusBarHidden(prev => !prev);
              }}
              label="Toogle Status Bar"
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

export function SafeAreaViewJustifyContentExample() {
  return (
    <SafeAreaView
      style={{
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'lightblue',
        flex: 1,
      }}>
      <View style={{backgroundColor: 'red', width: 150, height: 100}}>
        <Text>alignSelf not set</Text>
      </View>
      <View
        style={{
          backgroundColor: 'green',
          width: 200,
          height: 100,
          alignSelf: 'flex-end',
        }}>
        <Text>alignSelf: 'flex-end'</Text>
      </View>
      <View style={{backgroundColor: 'red', alignSelf: 'stretch', height: 100}}>
        <Text>alignSelf: 'stretch'</Text>
      </View>
      <View
        style={{
          backgroundColor: 'green',
          width: 200,
          alignSelf: 'flex-start',
          height: 100,
        }}>
        <Text>alignSelf: 'flex-start'</Text>
      </View>
    </SafeAreaView>
  );
}
