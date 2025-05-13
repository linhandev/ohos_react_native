import React, {useEffect} from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Systrace,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {PALETTE} from './palette';
import {useEnvironment} from '../contexts';

const NavigationContext = React.createContext<
  | {
      currentPageName: string;
      navigateTo: (pageName: string) => void;
      registerPageName: (pageName: string, previousName?: string) => void;
      unregisterPageName: (pageName: string) => void;
      registeredPageNames: string[];
    }
  | undefined
>(undefined);

export function NavigationContainer({
  initialPage = 'INDEX',
  children,
}: {
  initialPage?: string;
  children: any;
}) {
  const [currentPageName, setCurrentPageName] = React.useState(initialPage);
  const [registeredPageNames, setRegisteredPageNames] = React.useState<
    string[]
  >([]);

  return (
    <NavigationContext.Provider
      value={{
        currentPageName,
        navigateTo: setCurrentPageName,
        registerPageName: (newName: string, previousName?: string) => {
          setRegisteredPageNames(pageNames => {
            let updated = [...pageNames];

            if (previousName && previousName !== newName) {
              const index = updated.indexOf(previousName);
              if (index !== -1) {
                updated.splice(index, 1, newName);
                return updated;
              }
            }

            if (!updated.includes(newName)) {
              updated.push(newName);
            }

            return updated;
          });
        },
        unregisterPageName: (pageName: string) => {
          setRegisteredPageNames(pageNames =>
            pageNames.filter(name => name !== pageName),
          );
        },

        registeredPageNames,
      }}>
      <View style={{width: '100%', height: '100%', flexDirection: 'column'}}>
        <Page name="INDEX">
          <IndexPage />
        </Page>
        {children}
      </View>
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return React.useContext(NavigationContext)!;
}
export function Page({name, children}: {name: string; children: any}) {
  const {currentPageName, navigateTo, registerPageName, unregisterPageName} =
    useNavigation();

  const prevNameRef = React.useRef<string | undefined>(undefined); // 保存初始的name

  useEffect(() => {
    if (name !== 'INDEX') {
      const previousName = prevNameRef.current;
      prevNameRef.current = name;
      registerPageName(name, previousName);

      if (previousName && previousName !== name) {
        unregisterPageName?.(previousName);
      }
    }
  }, [name]);

  return name === currentPageName ? (
    <View style={{width: '100%', height: '100%'}}>
      {name !== 'INDEX' && (
        <View style={{backgroundColor: PALETTE.REACT_CYAN_DARK}}>
          <TouchableOpacity
            onPress={() => {
              Systrace.beginEvent('#TESTER::BACK');
              Systrace.endEvent();
              navigateTo('INDEX');
            }}>
            <Text
              style={[styles.buttonText, {color: PALETTE.REACT_CYAN_LIGHT}]}>
              {'‹ Back'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{width: '100%', flex: 1}}>{children}</View>
    </View>
  ) : null;
}

export function IndexPage() {
  const {navigateTo, registeredPageNames} = useNavigation();
  const {env} = useEnvironment();

  return (
    <FlatList
      data={registeredPageNames}
      ListHeaderComponent={
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}>
            <Text
              style={{
                color: '#EEE',
                fontSize: 24,
                fontWeight: 'bold',
                padding: 16,
                paddingBottom: 0,
              }}>
              RN Tester
              {'rnohArchitecture' in Platform.constants
                ? (` (${Platform.constants.rnohArchitecture})` as string)
                : ''}
            </Text>
          </View>
          <Text style={styles.envStatusText}>
            {`Internet connected: ${env.isConnectedToInternet}`}
          </Text>
          <Text style={styles.envStatusText}>
            {`Driver initialized: ${!!env.driver}`}
          </Text>
        </>
      }
      renderItem={({item}) => {
        return (
          <View style={{backgroundColor: PALETTE.REACT_CYAN_DARK}}>
            <TouchableOpacity
              onPress={() => {
                navigateTo(item);
              }}>
              <Text style={styles.buttonText}>{item}</Text>
            </TouchableOpacity>
          </View>
        );
      }}
      ItemSeparatorComponent={() => (
        <View
          style={{height: StyleSheet.hairlineWidth, backgroundColor: '#666'}}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#888',
  },
  buttonText: {
    width: '100%',
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 24,
    color: 'white',
    backgroundColor: 'black',
  },
  envStatusText: {
    color: '#EEE',
    fontSize: 12,
    fontWeight: 'bold',
    padding: 16,
    paddingTop: 0,
  },
});
