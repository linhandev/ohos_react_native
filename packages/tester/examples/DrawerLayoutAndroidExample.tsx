/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useRef, useState} from 'react';
import {
  Button,
  DrawerLayoutAndroid,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export const DrawerLayoutAndroidExample = () => {
  const drawer = useRef<null | any>(null);
  const [drawerOpenedCount, setDrawerOpenedCount] = useState(0);
  const [drawerClosedCount, setDrawerClosedCount] = useState(0);
  const [drawerPosition, setDrawerPosition] = useState<'left' | 'right'>(
    'left',
  );
  const changeDrawerPosition = () => {
    if (drawerPosition === 'left') {
      setDrawerPosition('right');
    } else {
      setDrawerPosition('left');
    }
  };

  const navigationView = () => (
    <View style={styles.container}>
      <Text style={styles.paragraph}>I'm in the Drawer!</Text>
      <Button
        title="Close drawer"
        /* $FlowFixMe */
        onPress={() => drawer.current.closeDrawer()}
      />
    </View>
  );

  return (
    <DrawerLayoutAndroid
      /* $FlowFixMe */
      ref={drawer}
      drawerWidth={300}
      drawerPosition={drawerPosition}
      drawerBackgroundColor={'lightgrey'}
      style={{backgroundColor: 'white'}}
      onDrawerClose={() => {
        setDrawerClosedCount(drawerClosedCount + 1);
      }}
      onDrawerOpen={() => {
        setDrawerOpenedCount(drawerOpenedCount + 1);
      }}
      renderNavigationView={navigationView}>
      <View style={styles.container}>
        <Text style={[styles.paragraph]}>Drawer on the {drawerPosition}!</Text>
        <Button
          title="Change Drawer Position"
          onPress={() => changeDrawerPosition()}
        />
        <Text style={styles.paragraph}>Press the button below to see it!</Text>
        <Button
          title="Open drawer"
          /* $FlowFixMe */
          onPress={() => drawer.current.openDrawer()}
        />
        <Text style={styles.paragraph}>
          {`Drawer opened ${drawerOpenedCount} times.\nDrawer closed ${drawerClosedCount} times.`}
        </Text>
      </View>
    </DrawerLayoutAndroid>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  paragraph: {
    padding: 16,
    fontSize: 15,
    textAlign: 'center',
  },
});
