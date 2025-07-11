import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import * as exampleByName from './examples';
import {NavigationContainer, Page} from './components';
import {Benchmarker, DeepTree, SierpinskiTriangle} from './benchmarks';
import {PortalHost, PortalProvider} from '@gorhom/portal';
import * as testSuiteByName from './tests';
import {Tester} from '@rnoh/testerino';
import {Environment} from './contexts';

const {TesterExample, SequentialTester, ...remainingExampleByName} =
  exampleByName;

function App() {
  return (
    <Environment>
      <View style={{backgroundColor: 'black'}}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={{paddingBottom: 0}}>
          <NavigationContainer>
            <PortalProvider>
              <View id="__harmony::ready" />
              <Page name="CONCURRENT TESTER">
                <TesterExample
                  filter={({tags}) => {
                    return !tags.includes('sequential');
                  }}
                />
              </Page>
              <Page name="CONCURRENT TESTER: DEV">
                <TesterExample
                  filter={({tags}) => {
                    return !tags.includes('sequential') && tags.includes('dev');
                  }}
                />
              </Page>
              <Page name={'SEQUENTIAL TESTER [driver required]'}>
                <SequentialTester
                  filter={({tags}) => {
                    return tags.includes('sequential');
                  }}
                />
              </Page>
              <Page name="SEQUENTIAL TESTER: DEV">
                <SequentialTester
                  filter={({tags}) => {
                    return tags.includes('sequential') && tags.includes('dev');
                  }}
                />
              </Page>
              {Object.keys(testSuiteByName).map(testSuiteName => {
                const TestSuite =
                  testSuiteByName[
                    testSuiteName as keyof typeof testSuiteByName
                  ];
                return (
                  <Page
                    key={testSuiteName}
                    name={`${testSuiteName.replace('Test', '')}`}>
                    <Tester
                      style={{flex: 1}}
                      filter={({tags}) => {
                        return !tags.includes('sequential');
                      }}>
                      <ScrollView style={{flex: 1}}>
                        <TestSuite key={testSuiteName} />
                      </ScrollView>
                    </Tester>
                  </Page>
                );
              })}
              <Page name="BENCHMARK: DEEP TREE">
                <Benchmarker
                  samplesCount={0}
                  renderContent={refreshKey =>
                    refreshKey % 2 === 0 ? (
                      <DeepTree depth={9} breadth={2} id={0} wrap={1} />
                    ) : null
                  }
                />
              </Page>
              <Page name="BENCHMARK: DEEP TREE (20 samples)">
                <Benchmarker
                  samplesCount={20}
                  renderContent={refreshKey =>
                    refreshKey % 2 === 0 ? (
                      <DeepTree depth={6} breadth={2} id={0} wrap={1} />
                    ) : null
                  }
                />
              </Page>
              <Page name="BENCHMARK: UPDATING COLORS">
                <Benchmarker
                  samplesCount={100}
                  renderContent={refreshKey => (
                    <SierpinskiTriangle
                      s={150}
                      x={150}
                      y={75}
                      depth={1}
                      renderCount={refreshKey}
                    />
                  )}
                />
              </Page>
              <Page name="BENCHMARK: UPDATING LAYOUT">
                <Benchmarker
                  samplesCount={200}
                  renderContent={refreshKey => (
                    <SierpinskiTriangle
                      s={refreshKey}
                      x={160}
                      y={75}
                      depth={1}
                      renderCount={refreshKey}
                    />
                  )}
                />
              </Page>
              {Object.entries(remainingExampleByName).map(
                ([exampleName, Example]) => {
                  return (
                    <Page key={exampleName} name={`EXAMPLE: ${exampleName}`}>
                      <Example />
                    </Page>
                  );
                },
              )}
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {zIndex: 100, pointerEvents: 'box-none'},
                ]}>
                <PortalHost name="ModalHost" />
              </View>
            </PortalProvider>
          </NavigationContainer>
        </SafeAreaView>
      </View>
    </Environment>
  );
}

export default App;
