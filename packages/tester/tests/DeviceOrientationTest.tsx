/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {TestSuite} from '@rnoh/testerino';
import React, {useEffect, useState} from 'react';
import {DeviceEventEmitter, StyleSheet, Text, View} from 'react-native';
import {TestCase} from '../components';

interface OrientationEvent {
  name:
    | 'portrait-primary'
    | 'portrait-secondary'
    | 'landscape-primary'
    | 'landscape-secondary';
  rotationDegrees: number;
  isLandscape: boolean;
}

export function DeviceOrientationTest() {
  const [currentOrientation, setCurrentOrientation] = useState<
    OrientationEvent | undefined
  >(undefined);

  const [orientationHistory, setOrientationHistory] = useState<
    OrientationEvent[]
  >([]);

  useEffect(() => {
    const onOrientationChange = (orientation: OrientationEvent) => {
      setCurrentOrientation(orientation);
      setOrientationHistory(prevHistory => [...prevHistory, orientation]);
    };

    const subscription = DeviceEventEmitter.addListener(
      'namedOrientationDidChange',
      onOrientationChange,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <TestSuite name="DeviceOrientation">
      <TestCase.Example itShould="show current orientation and a history of changes.">
        <View style={styles.container}>
          <Text style={styles.header}>Current Orientation Data:</Text>
          {currentOrientation ? (
            <View style={styles.dataContainer}>
              <Text style={styles.dataLabel}>Name:</Text>
              <Text style={styles.dataValue}>{currentOrientation.name}</Text>

              <Text style={styles.dataLabel}>Degrees:</Text>
              <Text style={styles.dataValue}>
                {currentOrientation.rotationDegrees}°
              </Text>

              <Text style={styles.dataLabel}>Is Landscape:</Text>
              <Text style={styles.dataValue}>
                {currentOrientation.isLandscape.toString()}
              </Text>
            </View>
          ) : (
            <Text style={styles.text}>
              Waiting for first orientation event...
            </Text>
          )}

          <Text style={styles.header}>History of Orientations:</Text>
          <Text style={styles.historyText}>
            {orientationHistory.length > 0
              ? orientationHistory.map(o => o.name).join(' → ')
              : 'No orientation changes have been recorded yet.'}
          </Text>
        </View>
      </TestCase.Example>
    </TestSuite>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4,
  },
  dataContainer: {
    paddingLeft: 10,
  },
  dataLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    marginTop: 4,
  },
  dataValue: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: 'bold',
    marginBottom: 4,
    paddingLeft: 10,
  },
  text: {
    fontSize: 14,
    marginLeft: 10,
    fontStyle: 'italic',
  },
  historyText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#667',
    paddingLeft: 10,
  },
});
