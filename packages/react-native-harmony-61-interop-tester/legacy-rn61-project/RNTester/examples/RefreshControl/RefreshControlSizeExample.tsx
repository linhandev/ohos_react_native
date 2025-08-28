'use strict';
import React from 'react';
import {
  ScrollView,
  RefreshControl,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export const RefreshControlExample = () => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [size, setSize] = React.useState(RefreshControl.SIZE.DEFAULT);

  const _onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 5000);
  };

  const toggleRefreshControlSize = () => {
    setSize((prevSize) =>
      prevSize === RefreshControl.SIZE.DEFAULT
        ? RefreshControl.SIZE.LARGE
        : RefreshControl.SIZE.DEFAULT,
    );
  };

  return (
    <ScrollView
      style={{
        backgroundColor: 'pink',
        flex: 1,
      }}
      contentContainerStyle={{
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
      }}
      refreshControl={
        <RefreshControl
          size={size}
          refreshing={isRefreshing}
          onRefresh={_onRefresh}
          tintColor="#ff0000"
          title="Loading..."
          titleColor="#00ff00"
          colors={['#ff0000', '#00ff00', '#0000ff']}
          progressBackgroundColor="#ffff00"
        />
      }>
      <TouchableWithoutFeedback onPress={toggleRefreshControlSize}>
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              alignSelf: 'center',
              textAlign: 'center',
            }}>
            RefreshControl.SIZE is:{' '}
            {size === RefreshControl.SIZE.DEFAULT ? 'default' : 'large'}
            {'\n'}Click anywhere to change it.
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

// This needs to be set to allow pull-to-refresh
export const simpleExampleContainer = true;

export const title = '[RNOH] <RefreshControl>:size';
export const description =
  "Test 0.61 interop handling of RefreshControl's size prop";
export const examples = [
  {
    title: 'Simple refresh',
    render: () => <RefreshControlExample />,
  },
];
