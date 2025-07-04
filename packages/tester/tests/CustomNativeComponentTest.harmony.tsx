import {TestSuite} from '@rnoh/testerino';
import {
  SampleComponent,
  SampleComponentRef,
  GeneratedSampleComponentCAPI,
  GeneratedSampleComponentCAPIRef,
  GeneratedSampleComponentArkTSRef,
  GeneratedSampleComponentArkTS,
  CodegenLibSampleComponent,
  ContainerView,
  Blank,
  BindSheetView,
} from 'react-native-sample-package';
import {useEffect, useState} from 'react';
import React from 'react';
import {Button, Effect, Ref, TestCase} from '../components';
import {IncomingData as GeneratedSampleNativeComponentArkTSCustomProps} from 'react-native-harmony-sample-package/src/specs/v1/GeneratedSampleNativeComponent';
import {
  IncomingData as GeneratedSampleNativeComponentCAPICustomProps,
  SupportedCommandArgs as GeneratedSampleNativeComponentCAPICommandArgs,
} from 'react-native-harmony-sample-package/src/specs/v2/GeneratedSampleNativeComponent';
import {Text, TextInput, View, UIManager} from 'react-native';

export function CustomNativeComponentTest() {
  return (
    <TestSuite name="Custom Native Component">
      <ManualCustomComponentImplementationTest />
      <GeneratedCustomComponentTest />
      <ContainerViewTest />
      <BindSheetViewTest />
    </TestSuite>
  );
}

function ManualCustomComponentImplementationTest() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <TestSuite name="no codegen">
      <TestCase.Example itShould="render red rectangle">
        <SampleComponent backgroundColor="red" size={64} />
      </TestCase.Example>
      <TestCase.Example itShould="render green rectangle inside red rectangle">
        <SampleComponent backgroundColor="red" size={64}>
          <SampleComponent backgroundColor="green" size={32} />
        </SampleComponent>
      </TestCase.Example>
      <TestCase.Example itShould="render red rectangle with black text">
        <SampleComponent backgroundColor="red" size={64} textColor="black" />
      </TestCase.Example>
      <TestCase.Manual
        itShould="handle custom native event when clicked"
        initialState={false}
        arrange={({setState}) => (
          <SampleComponent
            backgroundColor="red"
            size={64}
            onSampleClick={() => setState(true)}
          />
        )}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase.Example itShould="change bgColor every second">
        <SampleComponent
          backgroundColor={refreshKey % 2 === 0 ? 'red' : 'green'}
          size={64}
        />
      </TestCase.Example>
      <TestCase.Example itShould="show and hide red rectangle">
        <View style={{height: 64}}>
          {refreshKey % 2 === 0 && (
            <SampleComponent
              backgroundColor={refreshKey % 2 === 0 ? 'red' : 'green'}
              size={64}
            />
          )}
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="show/hide blue rectangle">
        <SampleComponent backgroundColor="red" size={64}>
          <Blinker>
            <SampleComponent backgroundColor="blue" size={32} />
          </Blinker>
        </SampleComponent>
      </TestCase.Example>
      <TestCase.Example itShould="toggle font size in the component below button (native commands)">
        <Ref<SampleComponentRef>
          render={ref => {
            return (
              <>
                <Button
                  label="Toggle Font Size"
                  onPress={() => {
                    ref.current?.toggleFontSize();
                  }}
                />
                <SampleComponent ref={ref} backgroundColor="blue" size={32} />
              </>
            );
          }}
        />
      </TestCase.Example>
      <TestCase.Example itShould="not report an error when Blank is added as a child to SampleComponent">
        <SampleComponent backgroundColor="blue" size={32}>
          <Blank />
          <Blank />
          <Blank />
        </SampleComponent>
      </TestCase.Example>
    </TestSuite>
  );
}

function Blinker({children}: any) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <React.Fragment>
      <Button
        label="Run"
        onPress={() => {
          setIsVisible(prev => !prev);
        }}
      />
      {isVisible && children}
    </React.Fragment>
  );
}

function VerifyNativeCommandExists() {
  return (
    <TestSuite name="verify native commands">
      <TestCase.Logical
        itShould="verify that native command emitNativeEvent exists"
        fn={({expect}) => {
          const command = UIManager.getViewManagerConfig('GeneratedSampleView')
            ?.Commands?.emitNativeEvent;
          expect(command).to.be.eq('emitNativeEvent');
        }}
      />
    </TestSuite>
  );
}

function GeneratedCustomComponentTest() {
  return (
    <TestSuite name="generated custom component">
      <VerifyNativeCommandExists />
      <TestSuite name="ArkTS">
        <TestCase.Automated<
          GeneratedSampleNativeComponentArkTSCustomProps | undefined
        >
          itShould="ensure equality between provided and received data"
          initialState={undefined}
          arrange={({setState, done}) => {
            return (
              <Ref<GeneratedSampleComponentArkTSRef>
                render={ref => (
                  <GeneratedSampleComponentArkTS
                    ref={ref}
                    testProps={{
                      booleanTest: true,
                      intTest: 42,
                      floatTest: 42.5,
                      doubleTest: 42.5,
                      stringTest: 'foobar',
                      objectTest: {foo: {bar: 'baz'}},
                      colorTest: 'red',
                      arrayTest: ['foo', 'bar'],
                      readOnlyArrayTest: ['foo', 'bar'],
                      intEnumTest: 1,
                    }}
                    onDirectEvent={(state: any) => {
                      setState(state);
                      done();
                    }}>
                    <Effect
                      onMount={() => {
                        setTimeout(() =>
                          ref.current?.emitNativeEvent('directEvent'),
                        );
                      }}
                    />
                  </GeneratedSampleComponentArkTS>
                )}
              />
            );
          }}
          act={({}) => {}}
          assert={async ({expect, state}) => {
            expect(state?.booleanTest).to.be.true;
            expect(state?.booleanWithDefaultTest).to.be.true;
            expect(state?.intTest).to.be.eq(42);
            expect(state?.intWithDefault).to.be.eq(42);
            expect(state?.floatTest).closeTo(42.5, 0.001);
            expect(state?.floatWithDefaultTest).closeTo(42.5, 0.001);
            expect(state?.doubleTest).closeTo(42.5, 0.001);
            expect(state?.doubleWithDefaultTest).closeTo(42.5, 0.001);
            expect(state?.stringTest).to.be.eq('foobar');
            expect(state?.stringWithDefaultTest).to.be.eq('foobar');
            expect(state?.objectTest).to.deep.eq({foo: {bar: 'baz'}});
            expect(state?.arrayTest).to.deep.eq(['foo', 'bar']);
            expect(state?.readOnlyArrayTest).to.deep.eq(['foo', 'bar']);
            expect(state?.stringEnumTest).to.be.eq('foo');
            expect(state?.intEnumTest).to.be.eq(1);
          }}
        />
      </TestSuite>
      <TestSuite name="C-API">
        <TestCase.Automated<
          GeneratedSampleNativeComponentCAPICustomProps | undefined
        >
          skip={{
            android: true,
            harmony: {arkTs: 'C-API only test', cAPI: false},
          }}
          itShould="receive props and emit them back via event"
          initialState={undefined}
          arrange={({setState, done}) => {
            return (
              <Ref<GeneratedSampleComponentCAPIRef>
                render={ref => (
                  <GeneratedSampleComponentCAPI
                    ref={ref}
                    testProps={{
                      booleanTest: true,
                      intTest: 42,
                      floatTest: 42.5,
                      doubleTest: 42.5,
                      stringTest: 'foobar',
                      colorTest: 'red',
                      arrayTest: ['foo', 'bar'],
                      readOnlyArrayTest: ['foo', 'bar'],
                      objectTest: {foo: {bar: 'baz'}},
                    }}
                    onDirectEvent={(state: any) => {
                      setState(state);
                      done();
                    }}>
                    <Effect
                      onMount={() => {
                        setTimeout(() =>
                          ref.current?.emitNativeEvent('directEvent'),
                        );
                      }}
                    />
                  </GeneratedSampleComponentCAPI>
                )}
              />
            );
          }}
          act={() => {}}
          assert={async ({expect, state}) => {
            expect(state?.booleanTest).to.be.true;
            expect(state?.booleanWithDefaultTest).to.be.true;
            expect(state?.intTest).to.be.eq(42);
            expect(state?.intWithDefault).to.be.eq(42);
            expect(state?.floatTest).closeTo(42.5, 0.1);
            expect(state?.floatWithDefaultTest).closeTo(42.5, 0.1);
            expect(state?.doubleTest).closeTo(42.5, 0.1);
            expect(state?.doubleWithDefaultTest).closeTo(42.5, 0.1);
            expect(state?.stringTest).to.be.eq('foobar');
            expect(state?.stringWithDefaultTest).to.be.eq('foobar');
            expect(state?.arrayTest).to.deep.eq(['foo', 'bar']);
            expect(state?.readOnlyArrayTest).to.deep.eq(['foo', 'bar']);
            expect(state?.stringEnumTest).to.be.eq('foo');
            expect(state?.colorTest).to.be.not.undefined;
            expect(state?.objectTest?.foo?.bar).to.be.eq('baz');
          }}
        />
        <TestCase.Automated<
          GeneratedSampleNativeComponentCAPICommandArgs | undefined
        >
          tags={['sequential']}
          skip={{
            android: true,
            harmony: {arkTs: 'C-API only test', cAPI: false},
          }}
          itShould="receive command args and emit them back via event"
          initialState={undefined}
          arrange={({setState, done}) => {
            return (
              <Ref<GeneratedSampleComponentCAPIRef>
                render={ref => (
                  <GeneratedSampleComponentCAPI
                    ref={ref}
                    hidden
                    testProps={{
                      booleanTest: true,
                      intTest: 0,
                      floatTest: 0.0,
                      doubleTest: 0.0,
                      stringTest: '',
                      colorTest: 'blue',
                      arrayTest: [],
                      readOnlyArrayTest: [],
                      objectTest: {foo: {bar: ''}},
                    }}
                    onReceivedCommandArgs={(state: any) => {
                      setState(state);
                      done();
                    }}>
                    <Effect
                      onMount={() => {
                        setTimeout(() => {
                          ref.current?.emitCommandArgs(
                            42 /* intTest */,
                            42.42 /* floatTest */,
                            42.42 /* doubleTest */,
                            'foobar' /* stringTest */,
                            true /* booleanTest */,
                          );
                        });
                      }}
                    />
                  </GeneratedSampleComponentCAPI>
                )}
              />
            );
          }}
          act={({}) => {}}
          assert={async ({expect, state}) => {
            expect(state?.intTest).to.be.eq(42);
            expect(state?.floatTest).closeTo(42.5, 0.1);
            expect(state?.doubleTest).closeTo(42.5, 0.1);
            expect(state?.stringTest).eq('foobar');
            expect(state?.booleanTest).to.be.true;
          }}
        />
      </TestSuite>
      <TestSuite name="generated by codegen-lib">
        <TestCase.Manual
          itShould="mount ArkTS component that relies on the generated code by codegen-lib, and onMount is called only once"
          initialState={{
            text: '',
            count: 0,
          }}
          arrange={({setState}) => {
            return (
              <CodegenLibSampleComponent
                style={{width: 100, height: 100}}
                implementation="ArkTS"
                text="ArkTS"
                onMount={text => {
                  setState(prevState => ({
                    text,
                    count: prevState.count + 1,
                  }));
                }}
              />
            );
          }}
          assert={({expect, state}) => {
            expect(state.text).to.be.eq('ArkTS');
            expect(state.count).to.be.eq(1);
          }}
        />
        <TestCase.Manual
          itShould="mount Cpp component that relies on the generated code by codegen-lib"
          initialState={''}
          arrange={({setState}) => {
            return (
              <CodegenLibSampleComponent
                style={{width: 100, height: 100}}
                implementation="Cpp"
                text="Cpp"
                onMount={text => {
                  setState(text);
                }}
              />
            );
          }}
          assert={({expect, state}) => {
            expect(state).to.be.eq('Cpp');
          }}
        />
      </TestSuite>
    </TestSuite>
  );
}

function ContainerViewTest() {
  const [childCount, setChildCount] = React.useState(0);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (childCount === 0) {
        setChildCount(5);
      } else {
        setChildCount(childCount - 1);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [childCount]);

  return (
    <TestSuite name="Custom container component">
      <TestCase.Example itShould="display a custom component with children">
        <ContainerView>
          <View style={{width: 100, height: 100, backgroundColor: 'red'}} />
          <Text>Content</Text>
        </ContainerView>
      </TestCase.Example>

      <TestCase.Example itShould="maintain correct positions of custom components when removing">
        <View style={{height: 128, backgroundColor: 'silver'}}>
          <ContainerView style={{backgroundColor: 'white'}}>
            <View collapsable={false}>
              {Array.from({length: childCount}, (_v, k) => (
                <ContainerView key={k}>
                  <Text>Element no. {k + 1}</Text>
                </ContainerView>
              ))}
            </View>
          </ContainerView>
        </View>
      </TestCase.Example>

      <TestCase.Example itShould="display a custom component with toggleable child">
        <ContainerView>
          <Blinker>
            <View style={{width: 100, height: 100, backgroundColor: 'red'}} />
            <Text>Content</Text>
          </Blinker>
        </ContainerView>
      </TestCase.Example>

      <TestCase.Example itShould="support arbitrary levels of custom component nesting">
        <ArbitraryNestingTest />
      </TestCase.Example>

      <TestCase.Example itShould="display a custom component with ArkTS and CAPI children">
        <ContainerView>
          <View
            collapsable={false}
            style={{backgroundColor: 'blue', padding: 40}}>
            <GeneratedSampleComponentArkTS
              testProps={{
                booleanTest: true,
                intTest: 42,
                floatTest: 42.5,
                doubleTest: 42.5,
                stringTest: 'foobar',
                objectTest: {foo: {bar: 'baz'}},
                colorTest: 'red',
                arrayTest: ['foo', 'bar'],
                readOnlyArrayTest: ['foo', 'bar'],
                intEnumTest: 1,
              }}
            />
          </View>
        </ContainerView>
      </TestCase.Example>
    </TestSuite>
  );
}

function ArbitraryNestingTest() {
  const [depthString, setDepthString] = React.useState('3');
  const depth = Math.min(parseInt(depthString) ?? 0, 15);

  return (
    <View>
      <TextInput
        value={depthString}
        onChange={e => setDepthString(e.nativeEvent.text)}
        style={{height: 30}}
      />
      <IterativeContainer depth={depth} />
    </View>
  );
}

function IterativeContainer({depth}: {depth: number}) {
  const COLORS = ['red', 'blue', 'white'];

  if (depth <= 0 || isNaN(depth)) {
    return null;
  }

  const backgroundColor = COLORS[depth % COLORS.length];

  return (
    <ContainerView>
      <View collapsable={false} style={{backgroundColor, padding: 10}}>
        <Text>Depth: {depth}</Text>
        <IterativeContainer depth={depth - 1} />
      </View>
    </ContainerView>
  );
}

function BindSheetViewTest() {
  const [showSheet, setShowSheet] = useState(false);

  return (
    <TestSuite name="Custom ArkTS component with bindSheet">
      <TestCase.Example itShould="display custom ArkTS component with bindSheet">
        {showSheet ? (
          <BindSheetView>
            <Button label="Dismiss Sheet" onPress={() => setShowSheet(false)} />
          </BindSheetView>
        ) : (
          <Button label="Show Sheet" onPress={() => setShowSheet(true)} />
        )}
      </TestCase.Example>
    </TestSuite>
  );
}
