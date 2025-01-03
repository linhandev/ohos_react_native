import React from 'react';
import {
  PermissionsAndroid,
  View,
  Button,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';

export function PermissionAndroidTest() {
  const checkPermission = async () => {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    Alert.alert(
      'Permission Check',
      hasPermission
        ? 'Camera permission is granted'
        : 'Camera permission is not granted',
    );
  };

  const requestPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message:
            'This app requires access to your camera to take photos and videos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Granted', 'You can now access the camera.');
      } else {
        Alert.alert('Permission Denied', 'Camera access is not granted.');
      }
    } catch (err) {
      console.error('Failed to request permission', err);
    }
  };

  const requestMultiplePermissions = async () => {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];

      const results = await PermissionsAndroid.requestMultiple(permissions);

      const grantedPermissions = [];
      const deniedPermissions = [];

      Object.entries(results).forEach(([key, value]) => {
        if (value === PermissionsAndroid.RESULTS.GRANTED) {
          grantedPermissions.push(key);
        } else {
          deniedPermissions.push(key);
        }
      });

      Alert.alert(
        'Permissions Result',
        `Granted: ${grantedPermissions.join(', ')}\nDenied: ${deniedPermissions.join(', ')}`,
      );
    } catch (err) {
      console.error('Failed to request multiple permissions', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PermissionsAndroid Demo</Text>
      <Button title="Check Camera Permission" onPress={checkPermission} />
      <View style={styles.spacing} />
      <Button title="Request Camera Permission" onPress={requestPermission} />
      <View style={styles.spacing} />
      <Button
        title="Request Multiple Permissions"
        onPress={requestMultiplePermissions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  spacing: {
    height: 20,
  },
});
