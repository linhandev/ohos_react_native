import React from 'react';
import {Button, SafeAreaView, StyleSheet, Text} from 'react-native';

export function TransparentExample() {
  const [count, setCount] = React.useState(0);

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">
      <Text style={styles.title}>
        Transparent Example {'\n'}
        <Text style={styles.subtitle}>
          All buttons should react to presses, unless covered by another
          component
        </Text>
      </Text>
      <Button
        title={`Pressed: ${count} time${count === 1 ? '' : 's'}`}
        onPress={() => setCount(c => c + 1)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#ff000010',
    justifyContent: 'center',
  },
  title: {
    position: 'absolute',
    top: 40,
    fontSize: 36,
  },
  subtitle: {
    fontSize: 18,
  },
});
