import React from 'react';
import {
  ActionSheetIOS,
  View,
  Button,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';

export function ActionSheetIOSTest() {
  const showActionSheet = () => {
    const options = ['Option 1', 'Option 2', 'Cancel'];
    const destructiveIndex = 1; // Highlight "Option 2" as destructive
    const cancelButtonIndex = 2; // "Cancel" button index

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: destructiveIndex,
        title: 'Choose an Option',
        message: 'This is an ActionSheet demo',
      },
      buttonIndex => {
        if (buttonIndex === cancelButtonIndex) {
          Alert.alert('You canceled the ActionSheet');
        } else {
          Alert.alert(`You selected: ${options[buttonIndex]}`);
        }
      },
    );
  };

  const showShareSheet = () => {
    const shareOptions = {
      message: 'Check out this awesome React Native demo!',
      url: 'https://reactnative.dev/',
      subject: 'React Native Demo', // iOS email subject
    };

    ActionSheetIOS.showShareActionSheetWithOptions(
      shareOptions,
      error => {
        if (error) {
          Alert.alert('An error occurred while sharing:', error.message);
        }
      },
      (completed, sharedMethod) => {
        if (completed) {
          Alert.alert(`Shared successfully using: ${sharedMethod}`);
        } else {
          Alert.alert('Sharing was canceled');
        }
      },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ActionSheetIOS Demo</Text>
      <Button title="Show Action Sheet" onPress={showActionSheet} />
      <View style={styles.spacing} />
      <Button title="Show Share Sheet" onPress={showShareSheet} />
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
