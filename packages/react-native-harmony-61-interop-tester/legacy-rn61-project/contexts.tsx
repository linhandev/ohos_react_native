/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
// Driver will be integrated later along with testerino
// import {Driver} from '@rnoh/react-native-harmony-test-kit';
type Driver = null;

export const AppParamsContext = React.createContext(undefined);

export type EnvCtxType = {
  isConnectedToInternet: boolean;
  driver?: Driver;
};

const EnvCtx = React.createContext<EnvCtxType>({isConnectedToInternet: false});

async function checkIsInternetAvailable() {
  try {
    await fetch('https://www.gitcode.com', {
      method: 'HEAD',
    });
    return true;
  } catch (error) {
    return false;
  }
}

export const Environment = ({children}: {children: any}) => {
  const [internetAvailability, setInternetAvailability] = useState<
    'CHECKING' | 'AVAILABLE' | 'NOT_AVAILABLE'
  >('CHECKING');
  const [driver, setDriver] = useState<Driver>();

  useEffect(() => {
    (async () => {
      setInternetAvailability(
        (await checkIsInternetAvailable()) ? 'AVAILABLE' : 'NOT_AVAILABLE',
      );

      //   const driver_ = await Driver.create();
      //   setDriver(driver_);
    })();
  }, []);

  if (internetAvailability === 'CHECKING') {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}>
        <Text>Preparing testing environment...</Text>
      </View>
    );
  }

  return (
    <EnvCtx.Provider
      value={{
        isConnectedToInternet: internetAvailability === 'AVAILABLE',
        driver: driver,
      }}>
      {children}
    </EnvCtx.Provider>
  );
};

export function useEnvironment() {
  return {env: React.useContext(EnvCtx)!};
}
