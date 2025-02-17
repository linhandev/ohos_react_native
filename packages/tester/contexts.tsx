import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {Driver} from '@rnoh/react-native-harmony-test-kit';

export const AppParamsContext = React.createContext(undefined);

export type EnvCtxType = {
  isConnectedToInternet: boolean;
  driver?: Driver;
};

const EnvCtx = React.createContext<EnvCtxType>({isConnectedToInternet: false});

async function checkIsInternetAvailable() {
  try {
    await fetch('https://www.google.com', {
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

      const driver_ = await Driver.create();
      setDriver(driver_);
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
