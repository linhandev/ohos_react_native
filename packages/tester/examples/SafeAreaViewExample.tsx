import {useEffect, useRef, useState} from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
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

// The following example demonstrates the use of SafeAreaView with edge cases
// such as nested SafeAreaView, SafeAreaView with insets, and SafeAreaView with
// animation (and outside the viewport)
// To best way to test these edge cases is to replace App.tsx content with this
// but keep in my mind that the safe area insets are not applied on first render
export const SafeAreaViewEdgeCases = () => {
  const slideAnim = useRef(new Animated.Value(0)).current; // Initial value for Y-axis position

  useEffect(() => {
    // Start the animation on component mount
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const slideIn = () => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [168, 0], // 120 (+ 28) - remove 28px in App.tsx
  });

  return (
    <View
      style={{
        // marginTop: 40,
        // backgroundColor: "pink",
        flex: 1,
        // paddingBottom: 28, // manipulate this value to see the effect
      }}>
      <SafeAreaView
        id="TOP SAFE AREA - top and bottom padding"
        testID="TOP SAFE AREA - top and bottom padding"
        style={{backgroundColor: 'black', flex: 1, padding: 20}}>
        <View style={{flex: 1}}>
          <SafeAreaView
            id="TOP NESTED SAFE AREA - no paddings"
            testID="TOP NESTED SAFE AREA - no paddings"
            style={{backgroundColor: 'blue'}}>
            <View style={{padding: 16, backgroundColor: 'yellow'}}>
              <Text>
                This yellow area is wrapped with nested SafeAreaView (with blue
                background). Notice there is no blue background and no extra
                padding.
              </Text>
            </View>
          </SafeAreaView>
          <View style={{flex: 1, backgroundColor: 'lightblue', padding: 16}}>
            <Text>View with blue background - to remove this text</Text>
            <View style={{marginTop: 10, gap: 10}}>
              <Button label="Slide In" onPress={slideIn} />
              <Button label="Slide Out" onPress={slideOut} />
            </View>
            <ScrollView style={{backgroundColor: 'pink', marginVertical: 16}}>
              <View style={{borderWidth: 1, margin: 16, height: 500}}>
                <Text>View to make scroll view scrollable</Text>
              </View>
              <View style={{borderWidth: 1, margin: 16, height: 500}}>
                <Text>View to make scroll view scrollable</Text>
              </View>
              <SafeAreaView
                id="NESTED SAFE AREA IN SCROLL VIEW"
                testID="NESTED SAFE AREA IN SCROLL VIEW"
                style={{backgroundColor: 'blue'}}>
                <View
                  style={{
                    padding: 16,
                    backgroundColor: 'lightgreen',
                  }}>
                  <Text>
                    This green area is wrapper with nested SafeAreaView (with
                    blue background). Notice there is no blue background nor
                    extra padding.
                  </Text>
                </View>
              </SafeAreaView>
              <View style={{borderWidth: 1, margin: 16, height: 500}}>
                <Text>View to make scroll view scrollable</Text>
              </View>
            </ScrollView>
          </View>
          <SafeAreaView
            id="BOTTOM NESTED SAFE AREA"
            testID="BOTTOM NESTED SAFE AREA"
            style={{backgroundColor: 'blue'}}>
            <View
              style={{padding: 16, backgroundColor: 'lightgreen', height: 70}}>
              <Text>
                This green area is wrapper with nested SafeAreaView (with blue
                background). Notice there is no blue background nor extra
                padding.
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </SafeAreaView>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '100%',
            bottom: 0,
            overflow: 'hidden',
          },
          {transform: [{translateY}]},
        ]}>
        <View
          style={{
            backgroundColor: 'red',
            height: 140,
          }}>
          <SafeAreaView
            id="SAFE AREA INSIDE ANIMATED VIEW"
            testID="SAFE AREA INSIDE ANIMATED VIEW">
            <View
              style={{
                height: '100%', // 60px
                width: '100%',
                backgroundColor: 'yellow',
                padding: 16,
              }}>
              <Text>
                This yellow area is Animated.View and SafeAreaView is placed
                inside the animated content. You should see applied bottom
                padding with red background.
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </Animated.View>
    </View>
  );
};

// The following example demonstrates the use of SafeAreaView with explicit bottom``
// padding of 0. This is useful when you want to remove the default bottom padding.
// To best way to test these edge cases is to replace App.tsx content with this
// but keep in my mind that the safe area insets are not applied on first render
export const SafeAreaViewExplicitBottomInset = () => {
  return (
    <SafeAreaView
      style={{
        backgroundColor: 'black',
        flex: 1,
        paddingBottom: 0,
      }}>
      <View style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: 'lightblue', padding: 16}}>
          <Text>
            This is a view with lightblue background and padding. The
            SafeAreaView is not nested and has explicit bottom padding of 0.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
