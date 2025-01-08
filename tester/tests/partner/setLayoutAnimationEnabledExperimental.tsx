import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  UIManager,
  LayoutAnimation,
  StyleSheet,
} from 'react-native';

const UIManagerLayoutAnimationExample = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleView = () => {
    // 使用 UIManager 来设置布局动画
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);

    // 手动触发布局动画
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setIsExpanded(prevState => !prevState);
  };

  return (
    <View style={styles.container}>
      <Button title="Toggle View" onPress={toggleView} />
      <View
        style={[
          styles.box,
          {height: isExpanded ? 200 : 50}, // 根据状态改变高度
        ]}>
        <Text style={styles.text}>Hello, this is an animated view!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: 'skyblue',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    overflow: 'hidden',
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});

export default UIManagerLayoutAnimationExample;
