import React, {createRef, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  UIManager,
  findNodeHandle,
} from 'react-native';
import {TestSuite} from '@rnoh/testerino';
import {Effect, Ref, Button, TestCase} from '../components';

export function UIManagerTest() {
  return (
    <TestSuite name="UIManager.measure">
      <TestCase.Automated
        itShould="not round text measurement to integers"
        initialState={{
          view: {width: 0, height: 0},
          text: {width: 0, height: 0},
        }}
        arrange={({setState, done}) => {
          return (
            <Ref<View>
              render={refView => {
                return (
                  <Ref<Text>
                    render={refText => {
                      return (
                        <Effect
                          onMount={() => {
                            setTimeout(() => {
                              refText.current?.measure(
                                (x, y, width, height, _left, _top) => {
                                  setState(prev => ({
                                    ...prev,
                                    text: {width, height},
                                  }));
                                },
                              );
                              refView.current?.measure(
                                (x, y, width, height, _left, _top) => {
                                  setState(prev => ({
                                    ...prev,
                                    view: {width, height},
                                  }));
                                },
                              );
                              done();
                            }, 100);
                          }}>
                          <Text
                            ref={refText}
                            style={{
                              width: 256.5,
                              height: 64.5,
                              color: '#fff',
                              borderColor: '#FF8041',
                              textAlign: 'center',
                              textAlignVertical: 'center',
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: '#7700FF',
                            }}>
                            <View
                              ref={refView}
                              style={{
                                backgroundColor: 'red',
                                width: 16.5,
                                height: 16.5,
                              }}
                            />
                            {'Measure me'}
                          </Text>
                        </Effect>
                      );
                    }}
                  />
                );
              }}
            />
          );
        }}
        act={() => {}}
        assert={({expect, state}) => {
          expect(state.view.width).to.be.closeTo(16.5, 0.49);
          expect(state.view.width).not.to.be.eq(16);
          expect(state.view.width).not.to.be.eq(17);
          expect(state.text.width).to.be.closeTo(256.5, 0.49);
          expect(state.text.width).not.to.be.eq(256);
          expect(state.text.width).not.to.be.eq(257);
          expect(state.text.height).to.be.closeTo(64.5, 0.49);
          expect(state.text.height).not.to.be.eq(65);
          expect(state.text.height).not.to.be.eq(64);
        }}
      />
      <TestCase.Example itShould="scroll down on press">
        <DispatchCommandTest />
      </TestCase.Example>
      <TestCase.Logical
        itShould="return view manager config"
        fn={({expect}) => {
          expect(UIManager.getViewManagerConfig('RCTView')).to.be.an('object');
        }}
      />
      <TestCase.Logical
        itShould="not return view manager config for non-existing view"
        fn={({expect}) => {
          expect(UIManager.getViewManagerConfig('RCTNotAView')).to.be.null;
        }}
      />
      <TestCase.Logical
        itShould="check if view manager config exists"
        fn={({expect}) => {
          expect(UIManager.hasViewManagerConfig('RCTView')).to.be.true;
          expect(UIManager.hasViewManagerConfig('RCTNotAView')).to.be.false;
        }}
      />
      <TestCase.Automated
        itShould="measure the view with respect to the window"
        initialState={{
          measure: {} as {x: number; y: number; width: number; height: number},
          ref: createRef<View>(),
        }}
        arrange={({state}) => {
          return (
            <View
              style={{
                width: 20,
                height: 20,
                backgroundColor: 'blue',
              }}
              ref={state.ref}
            />
          );
        }}
        act={({state, setState, done}) => {
          setTimeout(() => {
            state.ref.current?.measureInWindow(
              (x: number, y: number, width: number, height: number) => {
                setState(prevState => ({
                  ...prevState,
                  measure: {x, y, width, height},
                }));
              },
            );
            done();
          }, 1000);
        }}
        assert={({state, expect}) => {
          expect(state.measure.width).to.equal(20);
          expect(state.measure.height).to.equal(20);
          expect(state.measure.x).to.be.greaterThan(10);
          expect(state.measure.y).to.be.greaterThan(100);
        }}
      />
      <TestCase.Manual
        itShould="measure the view with respect to the parent"
        initialState={
          {} as {x: number; y: number; width: number; height: number}
        }
        arrange={({setState}) => <MeasureLayoutTest setState={setState} />}
        assert={({state, expect}) => {
          expect(state.width).to.be.equal(20);
          expect(state.height).to.be.equal(20);
          expect(state.x).to.be.equal(10);
          expect(state.y).to.be.equal(20);
        }}
      />
      <TestCase.Manual
        itShould="not crash when calling view is descendant of"
        initialState={undefined as boolean | undefined}
        arrange={({setState}) => <ViewIsDescendantOfTest setState={setState} />}
        assert={({state, expect}) => {
          expect(state).to.be.true;
        }}
      />
    </TestSuite>
  );
}
const MeasureLayoutTest = (props: {
  setState: React.Dispatch<
    React.SetStateAction<{x: number; y: number; width: number; height: number}>
  >;
}) => {
  const ref = useRef<View>(null);
  const containerRef = useRef<View>(null);
  return (
    <>
      <View
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'red',
          paddingLeft: 10,
          paddingTop: 20,
        }}
        ref={containerRef}>
        <View
          style={{
            width: 20,
            height: 20,
            backgroundColor: 'blue',
          }}
          ref={ref}
        />
      </View>
      <Button
        label="measureLayout"
        onPress={() => {
          if (ref.current && containerRef.current) {
            ref.current?.measureLayout(
              containerRef.current,
              (x, y, width, height) => {
                props.setState({x: x, y: y, width: width, height: height});
              },
              () => {
                props.setState({x: -1, y: -1, width: -1, height: -1});
              },
            );
          }
        }}
      />
    </>
  );
};

function DispatchCommandTest() {
  const ref = useRef<ScrollView>(null);

  return (
    <View>
      <ScrollView ref={ref} style={{height: 100}}>
        <View style={[styles.box, {backgroundColor: 'red'}]} />
        <View style={[styles.box, {backgroundColor: 'blue'}]} />
      </ScrollView>
      <Button
        label="scroll to bottom"
        onPress={() => {
          UIManager.dispatchViewManagerCommand(
            findNodeHandle(ref.current),
            'scrollToEnd',
            [true],
          );
        }}
      />
    </View>
  );
}

function ViewIsDescendantOfTest({
  setState,
}: {
  setState: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}) {
  const parentRef = useRef<View>(null);
  const childRef = useRef<View>(null);

  return (
    <View>
      <View
        ref={parentRef}
        collapsable={false}
        style={{height: 100, width: 100, backgroundColor: 'blue'}}>
        <View
          ref={childRef}
          collapsable={false}
          style={[styles.box, {backgroundColor: 'red'}]}
        />
      </View>
      <Button
        label="call viewIsDescendantOf"
        onPress={() => {
          // the method is not exported in the interface
          try {
            (UIManager as any).viewIsDescendantOf(
              findNodeHandle(childRef.current),
              findNodeHandle(parentRef.current),
              (isDescendantOf: boolean) => {
                console.log(isDescendantOf);
              },
            );
          } catch {
            setState(false);
          }
          setState(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 20,
    backgroundColor: 'red',
  },
  box: {
    height: 100,
    width: 50,
  },
  text: {
    height: 60,
  },
});
