/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const React = require('react');
const {useState} = require('react');
const {Button, StyleSheet, Text, View} = require('react-native');
const RNTesterBlock = require('../../components/RNTesterBlock');

const PromiseDoneTest = () => {
  const [status, setStatus] = useState('Press a button to test.');

  const handleSuccess = () => {
    setStatus('Promise is pending...');
    new Promise((resolve) => {
      setTimeout(() => resolve('Success!'), 1000);
    }).done((result) => {
      setStatus(`✅ Promise Resolved with: "${result}"`);
    });
  };

  const handleFailure = () => {
    setStatus('Promise is pending...');
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Something went wrong')), 1000);
    }).done(null, (error) => {
      setStatus(`❌ Promise Rejected with: "${error.message}"`);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{status}</Text>
      <View style={styles.buttonRow}>
        <Button title="Test Success" onPress={handleSuccess} />
        <Button title="Test Failure" onPress={handleFailure} color="#c00" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  statusText: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});

exports.title = 'RNOH 0.61 - Promise.done()';
exports.description = 'The nonstandard Promise.prototype.done() method has been removed in 0.70.';
exports.examples = [
  {
    title: 'Promise.done() Test',
    render(): React.Element<typeof RNTesterBlock> {
      return (
        <RNTesterBlock title="Test Promise.done() for success and failure">
          <PromiseDoneTest />
        </RNTesterBlock>
      );
    },
  },
];
