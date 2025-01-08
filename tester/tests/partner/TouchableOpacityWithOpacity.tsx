import React, {useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const TouchableOpacityWithOpacity = () => {
  const buttonRef = useRef(null);

  const handlePressIn = () => {
    // 使用 setOpacityTo 将透明度设置为 0.5
    if (buttonRef.current) {
      buttonRef.current.setOpacityTo(0.5); // 半透明
    }
  };

  const handlePressOut = () => {
    // 按钮抬起时恢复透明度为 1
    if (buttonRef.current) {
      buttonRef.current.setOpacityTo(1); // 恢复为不透明
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        ref={buttonRef} // 将 TouchableOpacity 引用给 ref
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => alert('Button Pressed!')}
        style={styles.button}>
        <Text style={styles.text}>TouchableOpacity</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 20,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});

export default TouchableOpacityWithOpacity;
