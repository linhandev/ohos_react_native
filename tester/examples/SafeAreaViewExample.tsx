import {useState} from 'react';
import {SafeAreaView, StatusBar, View} from 'react-native';
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
