import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TestCaseProps} from './TestPerformer';

export default function NextTestScreen({onComplete}: TestCaseProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown === 0) {
      onComplete();
    } else {
      const timer = setTimeout(() => {
        setCountdown(prevCountdown => prevCountdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <View style={styles.container}>
      {countdown > 0 && <Text>Next test will appear in {countdown}...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 48,
    marginBottom: 20,
  },
});
