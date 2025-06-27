import {
  EnterKeyHintType,
  EnterKeyHintTypeAndroid,
  type EmitterSubscription,
  KeyboardTypeOptions,
  Platform,
  Keyboard,
  ReturnKeyType,
  ReturnKeyTypeAndroid,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import {TestSuite} from '@rnoh/testerino';
import React, {useState, useRef, createRef, forwardRef} from 'react';
import {Button, Effect, StateKeeper, TestCase} from '../components';
import {useEnvironment} from '../contexts';

const KEYBOARD_TYPES: KeyboardTypeOptions[] = [
  'default',
  'number-pad',
  'decimal-pad',
  'numeric',
  'email-address',
  'phone-pad',
  'url',
];

const expectKeyboardToAppear = (timeout = 500): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    let keyboardListener: EmitterSubscription | undefined;
    const timeoutId = setTimeout(() => {
      keyboardListener?.remove();
      reject(new Error(`Keyboard did not show within ${timeout}ms`));
    }, timeout);

    keyboardListener = Keyboard.addListener('keyboardDidShow', () => {
      keyboardListener?.remove();
      clearTimeout(timeoutId);
      resolve();
    });
  });
};

const expectKeyboardToRemainHidden = (timeout = 500): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    let keyboardListener: EmitterSubscription | undefined;
    const timeoutId = setTimeout(() => {
      keyboardListener?.remove();
      resolve();
    }, timeout);

    keyboardListener = Keyboard.addListener('keyboardDidShow', () => {
      keyboardListener?.remove();
      clearTimeout(timeoutId);
      reject(new Error('Keyboard showed unexpectedly'));
    });
  });
};

export function TextInputTest() {
  const {
    env: {driver},
  } = useEnvironment();

  return (
    <TestSuite name="TextInput">
      <TestCase.Automated
        itShould="render textinput and change the text component based on the values inputted"
        tags={['sequential']}
        initialState={{
          text: '',
          ref: createRef<TextInput>(),
        }}
        arrange={({setState, state, done}) => (
          <TextInputWithText
            style={styles.textInput}
            ref={state.ref}
            onEndEditing={done}
            onChangeText={text => {
              setState(prev => ({...prev, text}));
            }}
          />
        )}
        act={async ({state, done}) => {
          await driver?.inputText(state.ref, 'ab');
          done();
          Keyboard.dismiss();
        }}
        assert={({expect, state}) => {
          expect(state.text).to.be.equal('ab');
        }}
      />
      <TestCase.Automated
        itShould="not crash when invalid keyboardType is supplied"
        tags={['sequential']}
        initialState={{
          keyboardOpened: false,
          ref: createRef<TextInput>(),
        }}
        arrange={({state}) => (
          <TextInputWithText style={styles.textInput} ref={state.ref} />
        )}
        act={async ({state, setState, done}) => {
          if (state.ref?.current) {
            try {
              state.ref.current.focus();

              await expectKeyboardToAppear();

              setState(prev => ({...prev, keyboardOpened: true}));
            } catch (error) {
              console.error(error);
            } finally {
              Keyboard.dismiss();
              done();
            }
          }
        }}
        assert={({expect, state}) => {
          expect(state.keyboardOpened).to.be.equal(true);
        }}
      />
      <TestCase.Example itShould="render textinput with set content">
        <TextInputWithTextContent style={styles.textInput} />
      </TestCase.Example>
      <TestCase.Automated
        itShould="render non-editable textInput"
        tags={['sequential']}
        initialState={{
          ref: createRef<TextInput>(),
        }}
        arrange={({state}) => (
          <TextInputWithText
            defaultValue="test"
            style={styles.textInput}
            editable={false}
            ref={state.ref}
          />
        )}
        act={async ({state, done}) => {
          if (state.ref?.current) {
            try {
              state.ref.current.focus();
              await expectKeyboardToRemainHidden();
            } catch (error) {
              console.error(error);
            } finally {
              done();
            }
          }
        }}
        assert={({expect}) => {
          expect(Keyboard.isVisible()).to.be.equal(false);
        }}
      />
      <TestCase.Example
        modal
        itShould="should log only once, after pressing space">
        <TextInput
          style={styles.textInput}
          value={' '}
          onChangeText={text => {
            console.log('text=', text);
          }}
        />
      </TestCase.Example>
      <TestCase.Example itShould="render textInput with Pacifico Regular font">
        <TextInputWithText
          style={[styles.textInput, {fontFamily: 'Pacifico-Regular'}]}
        />
      </TestCase.Example>
      <TestCase.Example itShould="render textInput with caret hidden">
        <TextInputWithText style={styles.textInput} caretHidden />
      </TestCase.Example>
      <TestCase.Example itShould="render textInput with red caret">
        <TextInputWithText style={styles.textInput} cursorColor={'red'} />
      </TestCase.Example>
      <TestCase.Automated
        itShould="report content size changes (onContentSizeChange)"
        tags={['sequential']}
        initialState={{
          contentSizeChanged: false,
          ref: createRef<TextInput>(),
        }}
        arrange={({state, setState}) => (
          <TextInputWithText
            style={styles.textInput}
            multiline
            ref={state.ref}
            onContentSizeChange={() => {
              setState(prev => ({...prev, contentSizeChanged: true}));
            }}
          />
        )}
        act={async ({state, done}) => {
          await driver?.inputText(state.ref, 'abc');
          done();
        }}
        assert={({expect, state}) => {
          expect(state.contentSizeChanged).to.be.true;
        }}
      />
      <TestSuite name="focus/blur">
        <TestCase.Automated
          itShould="blur text on submit (singleline)"
          tags={['sequential']}
          initialState={{
            ref: createRef<TextInput>(),
            blurred: false,
          }}
          arrange={({state, setState}) => (
            <TextInputWithText
              style={styles.textInput}
              submitBehavior="blurAndSubmit"
              ref={state.ref}
              onBlur={() => {
                setState(prev => ({...prev, blurred: true}));
              }}
            />
          )}
          act={async ({done, state}) => {
            await driver?.inputText(state.ref, 'abc');
            await driver?.keyEvent().key('Enter').send();
            done();
          }}
          assert={({expect, state}) => {
            expect(state.blurred).to.be.equal(true);
          }}
        />
        <TestCase.Automated
          itShould="blur text on submit (multiline)"
          tags={['sequential']}
          initialState={{
            ref: createRef<TextInput>(),
            blurred: false,
          }}
          arrange={({state, setState}) => (
            <TextInputWithText
              style={styles.textInput}
              submitBehavior="blurAndSubmit"
              multiline
              ref={state.ref}
              onBlur={() => {
                setState(prev => ({...prev, blurred: true}));
              }}
            />
          )}
          act={async ({state, done}) => {
            await driver?.inputText(state.ref, 'abc');
            await driver?.keyEvent().key('Enter').send();
            done();
          }}
          assert={({expect, state}) => {
            expect(state.blurred).to.be.equal(true);
          }}
        />
        <TestCase.Automated
          itShould="blur text after switching to another textinput"
          tags={['sequential']}
          initialState={{
            firstTextInputRef: createRef<TextInput>(),
            secondTextInputRef: createRef<TextInput>(),
            blurredFirstRef: false,
          }}
          arrange={({state, setState}) => (
            <>
              <TextInputWithText
                style={styles.textInput}
                ref={state.firstTextInputRef}
                onBlur={() => {
                  setState(prev => ({...prev, blurredFirstRef: true}));
                }}
              />
              <TextInputWithText
                style={styles.textInput}
                ref={state.secondTextInputRef}
              />
            </>
          )}
          act={async ({state, done}) => {
            await driver?.inputText(state.firstTextInputRef, 'abc');
            await driver?.inputText(state.secondTextInputRef, 'abc');

            done();
          }}
          assert={({expect, state}) => {
            expect(state.blurredFirstRef).to.be.equal(true);
          }}
        />
        <TestCase.Automated
          itShould="not blur text on submit (singleline)"
          tags={['sequential']}
          initialState={{
            ref: createRef<TextInput>(),
            blurred: false,
          }}
          arrange={({state, setState}) => (
            <TextInputWithText
              style={styles.textInput}
              submitBehavior="submit"
              ref={state.ref}
              onBlur={() => {
                setState(prev => ({...prev, blurred: true}));
              }}
            />
          )}
          act={async ({state, done}) => {
            await driver?.inputText(state.ref, 'abc');
            await driver?.keyEvent().key('Enter').send();
            done();
          }}
          assert={({expect, state}) => {
            expect(state.blurred).to.be.equal(false);
          }}
        />
        <TestCase.Automated
          itShould="not blur text on submit (multiline)"
          tags={['sequential']}
          initialState={{
            ref: createRef<TextInput>(),
            blurred: false,
          }}
          arrange={({state, setState}) => (
            <TextInputWithText
              style={styles.textInput}
              submitBehavior="submit"
              multiline
              ref={state.ref}
              onBlur={() => {
                setState(prev => ({...prev, blurred: true}));
              }}
            />
          )}
          act={async ({state, done}) => {
            await driver?.inputText(state.ref, 'abc');
            await driver?.keyEvent().key('Enter').send();
            done();
          }}
          assert={({expect, state}) => {
            expect(state.blurred).to.be.equal(false);
          }}
        />
        <TestCase.Manual
          modal
          itShould="automatically focus textInput when displayed"
          initialState={false}
          arrange={({setState}) => (
            <TextInputWithText
              style={styles.textInput}
              autoFocus
              onFocus={() => setState(true)}
            />
          )}
          assert={({expect, state}) => {
            expect(state).to.be.true;
          }}
        />
        <TestCase.Manual
          modal
          itShould="automatically focus textInput (multiline) when displayed"
          initialState={false}
          arrange={({setState}) => (
            <TextInputWithText
              style={styles.textInput}
              multiline
              autoFocus
              onFocus={() => setState(true)}
            />
          )}
          assert={({expect, state}) => {
            expect(state).to.be.true;
          }}
        />
        <TestCase.Automated
          itShould="focus textInput on click"
          tags={['sequential']}
          initialState={{
            ref: createRef<TextInput>(),
            focused: false,
          }}
          arrange={({state, setState}) => (
            <TextInput
              style={styles.textInput}
              ref={state.ref}
              onFocus={() => {
                setState(prev => ({...prev, focused: true}));
              }}
            />
          )}
          act={async ({done, state}) => {
            await driver?.click({ref: state.ref});
            try {
              await expectKeyboardToAppear();
            } catch (error) {
              console.error(error);
            } finally {
              done();
            }
          }}
          assert={({expect, state}) => {
            expect(state.focused).to.be.true;
          }}
        />
        <TestCase.Automated
          itShould="focus textInput when pressing the button"
          tags={['sequential']}
          initialState={{
            buttonRef: createRef<View>(),
            focused: false,
          }}
          arrange={({state, setState}) => (
            <FocusTextInputTest
              setFocused={() => setState(prev => ({...prev, focused: true}))}
              ref={state.buttonRef}
            />
          )}
          act={async ({done, state}) => {
            await driver?.click({ref: state.buttonRef});
            try {
              await expectKeyboardToAppear();
            } catch (error) {
              console.error(error);
            } finally {
              done();
            }
          }}
          assert={({expect, state}) => {
            expect(state.focused).to.be.true;
          }}
        />
      </TestSuite>
      <TestCase.Example itShould="render textinput with red placeholder">
        <TextInputWithText
          style={styles.textInput}
          placeholder="Placeholder"
          placeholderTextColor={'red'}
        />
      </TestCase.Example>
      <TestCase.Example itShould="render textinput with default selection color">
        <TextInputWithText style={styles.textInput} />
      </TestCase.Example>
      <TestCase.Example itShould="render textinput with green selection color">
        <TextInputWithText style={styles.textInput} selectionColor="green" />
      </TestCase.Example>
      <TestCase.Example itShould="render textinput with blue underline color">
        <TextInputWithText
          style={styles.textInput}
          underlineColorAndroid={'blue'}
        />
      </TestCase.Example>
      <TestCase.Automated
        itShould="not open the keyboard after focusing"
        tags={['sequential']}
        initialState={{
          ref: createRef<TextInput>(),
        }}
        arrange={({state}) => (
          <TextInputWithText
            style={styles.textInput}
            ref={state.ref}
            showSoftInputOnFocus={false}
          />
        )}
        act={async ({done, state}) => {
          await driver?.click({ref: state.ref});
          try {
            await expectKeyboardToRemainHidden();
          } catch (error) {
            console.error(error);
          } finally {
            done();
          }
        }}
        assert={({expect}) => {
          expect(Keyboard.isVisible()).to.be.false;
        }}
      />
      <TestCase.Example itShould="render multiline text input">
        <TextInputWithText style={styles.textInputBigger} multiline />
      </TestCase.Example>
      <TestCase.Example itShould="render multiline text input with common border">
        <TextInputWithText style={styles.multilineInput} multiline />
      </TestCase.Example>
      <TestCase.Example itShould="render multiline text input with Pacifico Regular font">
        <TextInputWithText
          style={[styles.textInputBigger, {fontFamily: 'Pacifico-Regular'}]}
          multiline
        />
      </TestCase.Example>
      <TestCase.Automated
        itShould="render text input with maximally 10 characters"
        tags={['sequential']}
        initialState={{
          ref: createRef<TextInput>(),
          text: '',
        }}
        arrange={({state, setState}) => (
          <TextInputWithText
            style={styles.textInput}
            ref={state.ref}
            maxLength={10}
            onChangeText={text => {
              setState(prev => ({...prev, text}));
            }}
          />
        )}
        act={async ({done, state}) => {
          await driver?.inputText(state.ref, '01234567891011');
          done();
        }}
        assert={({expect, state}) => {
          expect(state.text).to.be.equal('0123456789');
        }}
      />
      <TestCase.Example
        modal
        itShould="toggle between rendering 10 and 5 characters">
        <StateKeeper
          initialValue={10}
          renderContent={(maxLength, setMaxLength) => {
            return (
              <Effect
                onMount={() => {
                  const interval = setInterval(() => {
                    setMaxLength(prev => (prev === 10 ? 5 : 10));
                  }, 1000);
                  return () => {
                    clearInterval(interval);
                  };
                }}>
                <TextInputWithText
                  style={styles.textInput}
                  maxLength={maxLength}
                  defaultValue="1234567890"
                />
              </Effect>
            );
          }}
        />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="toggle between different capitalization modes"
        skip={{android: false, harmony: true}}
        //https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/408
      >
        <AutoCapitalize />
      </TestCase.Example>
      <TestCase.Automated
        itShould="trigger onSubmitEditing event after submiting"
        tags={['sequential']}
        initialState={{
          ref: createRef<TextInput>(),
          submitted: false,
        }}
        arrange={({state, setState}) => (
          <TextInputWithText
            style={styles.textInput}
            ref={state.ref}
            onSubmitEditing={() =>
              setState(prev => ({...prev, submitted: true}))
            }
          />
        )}
        act={async ({done, state}) => {
          await driver?.inputText(state.ref, 'abc');
          await driver?.keyEvent().key('Enter').send();
          done();
        }}
        assert={({expect, state}) => {
          expect(state.submitted).to.be.true;
        }}
      />
      <TestCase.Example modal itShould="toggle between different return keys">
        <ReturnKeyTypeView />
      </TestCase.Example>
      <TestSuite name="returnKeyLabel">
        <TestCase.Example itShould="display a proper label for the keyboard 'submit' button">
          <TextInput
            value="<default>: 完成 (en: complete)"
            style={{padding: 16, borderWidth: StyleSheet.hairlineWidth}}
          />
          <TextInput
            returnKeyLabel="search"
            value="'search': 搜索 (en: search)"
            style={{padding: 16, borderWidth: StyleSheet.hairlineWidth}}
          />
        </TestCase.Example>
      </TestSuite>
      <TestCase.Example modal itShould="toggle between different enter keys">
        <EnterKeyHintExample />
      </TestCase.Example>
      <TestCase.Example itShould="render secure text input (text obscured)">
        <TextInputWithText style={styles.textInput} secureTextEntry />
      </TestCase.Example>
      <TestCase.Automated
        itShould="trigger onKeyPress event after pressing key (press 'A' to pass)"
        tags={['sequential']}
        initialState={{
          ref: createRef<TextInput>(),
          key: '',
        }}
        arrange={({state, setState}) => (
          <TextInputWithText
            style={styles.textInput}
            ref={state.ref}
            onKeyPress={event => {
              const key = event.nativeEvent.key;
              setState(prev => ({...prev, key}));
            }}
          />
        )}
        act={async ({done, state}) => {
          await driver?.inputText(state.ref, 'a');
          done();
        }}
        assert={({expect, state}) => {
          expect(state.key).to.be.eq('a');
        }}
      />
      <TestCase.Manual
        modal
        itShould="trigger onKeyPress event after pressing key with Chinese Character (press 'ha' and select '哈' to pass)"
        initialState={''}
        arrange={({setState}) => (
          <TextInputWithText
            style={styles.textInput}
            autoFocus
            onKeyPress={event => {
              setState(event.nativeEvent.key);
            }}
          />
        )}
        assert={({expect, state}) => {
          expect(state).to.be.eq('哈');
        }}
      />
      <TestCase.Automated
        itShould="trigger onKeyPress event after pressing backspace"
        tags={['sequential']}
        initialState={{
          firstTextInputKey: '',
          secondTextInputKey: '',
          firstTextInputRef: createRef<TextInput>(),
          secondTextInputRef: createRef<TextInput>(),
        }}
        arrange={({state, setState}) => (
          <>
            <TextInputWithText
              style={styles.textInput}
              autoFocus
              defaultValue="a"
              ref={state.firstTextInputRef}
              onKeyPress={event => {
                const firstTextInputKey = event.nativeEvent.key;
                setState(prev => ({
                  ...prev,
                  firstTextInputKey,
                }));
              }}
            />
            <TextInputWithText
              style={styles.textInputBigger}
              multiline
              defaultValue="a"
              ref={state.secondTextInputRef}
              onKeyPress={event => {
                const secondTextInputKey = event.nativeEvent.key;
                setState(prev => ({
                  ...prev,
                  secondTextInputKey,
                }));
              }}
            />
          </>
        )}
        act={async ({done, state}) => {
          state.firstTextInputRef.current?.focus();
          await driver?.keyEvent().key('Backspace').send();
          state.secondTextInputRef.current?.focus();
          await driver?.keyEvent().key('Backspace').send();
          done();
        }}
        assert={({expect, state}) => {
          expect(state.firstTextInputKey).to.be.eq('Backspace');
          expect(state.secondTextInputKey).to.be.eq('Backspace');
        }}
      />
      <TestCase.Automated
        itShould="trigger onKeyPress event after pressing backspace when the text input is empty"
        tags={['sequential']}
        initialState={{
          firstTextInputKey: '',
          secondTextInputKey: '',
          firstTextInputRef: createRef<TextInput>(),
          secondTextInputRef: createRef<TextInput>(),
        }}
        arrange={({state, setState}) => (
          <>
            <TextInputWithText
              style={styles.textInput}
              autoFocus
              defaultValue=""
              ref={state.firstTextInputRef}
              onKeyPress={event => {
                const firstTextInputKey = event.nativeEvent.key;
                setState(prev => ({
                  ...prev,
                  firstTextInputKey,
                }));
              }}
            />
            <TextInputWithText
              style={styles.textInputBigger}
              multiline
              defaultValue=""
              ref={state.secondTextInputRef}
              onKeyPress={event => {
                const secondTextInputKey = event.nativeEvent.key;
                setState(prev => ({
                  ...prev,
                  secondTextInputKey,
                }));
              }}
            />
          </>
        )}
        act={async ({done, state}) => {
          state.firstTextInputRef.current?.focus();
          await driver?.keyEvent().key('Backspace').send();
          state.secondTextInputRef.current?.focus();
          await driver?.keyEvent().key('Backspace').send();
          done();
        }}
        assert={({expect, state}) => {
          expect(state.firstTextInputKey).to.be.eq('Backspace');
          expect(state.secondTextInputKey).to.be.eq('Backspace');
        }}
      />
      <TestCase.Manual
        modal
        itShould="trigger onKeyPress for a non-ASCII input (press 'a' to pass)"
        initialState={''}
        arrange={({setState}) => (
          <>
            <TextInputWithText
              style={styles.textInput}
              autoFocus
              defaultValue="你好😊"
              onKeyPress={event => setState(event.nativeEvent.key)}
            />
          </>
        )}
        assert={({expect, state}) => {
          expect(state).to.be.eq('a');
        }}
      />
      <TestCase.Automated
        itShould="show text input with default value (defaultProps)"
        tags={['sequential']}
        initialState={{
          ref: createRef<TextInput>(),
          text: '',
        }}
        arrange={({state, setState}) => (
          <DefaultProps
            ref={state.ref}
            defaultValue="defaultText"
            onSubmitEditing={e => {
              const text = e.nativeEvent.text;
              setState(prev => ({...prev, text}));
            }}
          />
        )}
        act={async ({done, state}) => {
          state.ref.current?.focus();
          await driver?.keyEvent().key('Enter').send();
          done();
        }}
        assert={({expect, state}) => {
          expect(state.text).to.be.eq('defaultText');
        }}
      />
      <TestCase.Automated
        itShould="show text input with default value (defaultValue)"
        tags={['sequential']}
        initialState={{
          ref: createRef<TextInput>(),
          text: '',
        }}
        arrange={({state, setState}) => (
          <TextInput
            style={styles.textInput}
            defaultValue="defaultText"
            ref={state.ref}
            onSubmitEditing={e => {
              const text = e.nativeEvent.text;
              setState(prev => ({...prev, text}));
            }}
          />
        )}
        act={async ({done, state}) => {
          state.ref.current?.focus();
          await driver?.keyEvent().key('Enter').send();
          done();
        }}
        assert={({expect, state}) => {
          expect(state.text).to.be.eq('defaultText');
        }}
      />
      <TestCase.Automated
        itShould="trigger onLayout event on mount"
        initialState={{}}
        tags={['sequential']}
        arrange={({setState, state}) => {
          return (
            <>
              <Text>{JSON.stringify(state)}</Text>
              <TextInput
                style={styles.textInput}
                onLayout={event => {
                  setState(event.nativeEvent.layout);
                }}
              />
            </>
          );
        }}
        act={async ({done}) => {
          // Event was received after done()
          await new Promise(resolve => setTimeout(resolve, 1000));
          done();
        }}
        assert={({expect, state}) => {
          expect(state).to.include.all.keys('width', 'height', 'x', 'y');
        }}
      />
      <TestCase.Example
        modal
        itShould="render textinputs with different keyboard types">
        <View>
          {KEYBOARD_TYPES.map(type => (
            <TextInputKeyboardType
              key={`singleline_${type}`}
              keyboardType={type}
            />
          ))}
        </View>
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="render multiline textinputs with different keyboard types">
        <View>
          {KEYBOARD_TYPES.map(type => (
            <TextInputKeyboardType
              key={`multiline_${type}`}
              keyboardType={type}
              multiline
            />
          ))}
        </View>
      </TestCase.Example>
      <TestCase.Example modal itShould="render textinput with allowFontScaling">
        <TextInputWithText
          style={styles.textInput}
          allowFontScaling
          defaultValue="Scaled"
        />
        <TextInputWithText
          style={styles.textInput}
          allowFontScaling={false}
          defaultValue="Not scaled"
        />
        <TextInputWithText
          style={[styles.textInput, {fontSize: 40}]}
          allowFontScaling={true}
          defaultValue="Scaled big"
        />
        <TextInputWithText
          style={[styles.textInput, {fontSize: 40}]}
          allowFontScaling={false}
          defaultValue="Not scaled big"
        />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="render textinput with different maxFontSizeMultiplier (change font scale in settings)">
        <TextInput
          style={styles.textInput}
          allowFontScaling={false}
          defaultValue="Non scaled"
        />
        <TextInput
          style={styles.textInput}
          defaultValue="maxFontSizeMultiplier 1.2"
          allowFontScaling
          maxFontSizeMultiplier={1.2}
        />
        <TextInput
          style={styles.textInput}
          defaultValue="maxFontSizeMultiplier 1.4"
          allowFontScaling
          maxFontSizeMultiplier={1.4}
        />
        <TextInput
          style={styles.textInput}
          allowFontScaling={true}
          maxFontSizeMultiplier={0}
          defaultValue="Scaled without limit"
        />
      </TestCase.Example>
      <TestCase.Example itShould="show textInput with padding" modal>
        <View style={{width: 300, height: 200}}>
          <TextInputWithText
            style={{
              paddingLeft: 10,
              paddingTop: 20,
              paddingRight: 30,
              paddingBottom: 40,
              backgroundColor: 'red',
            }}
          />
        </View>
      </TestCase.Example>
      <TestCase.Example itShould="show textInput multiline with padding" modal>
        <View style={{width: 300, height: 200}}>
          <TextInputWithText
            style={{
              paddingLeft: 10,
              paddingTop: 20,
              paddingRight: 30,
              paddingBottom: 40,
              backgroundColor: 'red',
              height: 100,
            }}
            multiline
          />
        </View>
      </TestCase.Example>
      <TestCase.Automated
        itShould="render textinput with readonly"
        tags={['sequential']}
        initialState={{
          ref: createRef<TextInput>(),
        }}
        arrange={({state}) => (
          <TextInputWithText
            defaultValue="readOnly"
            style={styles.textInput}
            readOnly={true}
            ref={state.ref}
          />
        )}
        act={async ({state, done}) => {
          if (state.ref?.current) {
            try {
              state.ref.current.focus();
              await expectKeyboardToRemainHidden();
            } catch (error) {
              console.error(error);
            } finally {
              done();
            }
          }
        }}
        assert={({expect}) => {
          expect(Keyboard.isVisible()).to.be.equal(false);
        }}
      />
      <TestCase.Example
        modal
        itShould="display bold, italic, large placeholder with a custom font">
        <TextInput
          style={{
            fontFamily: 'StintUltraCondensed-Regular',
            fontWeight: 'bold',
            fontSize: 24,
            fontStyle: 'italic',
          }}
          placeholder="placeholder"
        />
      </TestCase.Example>
      <TestCase.Example modal itShould="render textinput with red text color">
        <TextInputWithText style={[styles.textInput, {color: 'red'}]} />
      </TestCase.Example>
      <TestCase.Automated
        skip={{android: true, harmony: false}}
        itShould="clear text on focus"
        tags={['sequential']}
        initialState={{
          ref: createRef<TextInput>(),
          text: '',
        }}
        arrange={({state, setState}) => (
          <TextInputWithText
            style={styles.textInput}
            ref={state.ref}
            defaultValue=""
            selectTextOnFocus
            onChange={event => {
              const text = event.nativeEvent.text;
              setState(prev => ({...prev, text}));
            }}
            clearTextOnFocus
          />
        )}
        act={async ({done, state}) => {
          state.ref.current?.focus();
          try {
            await expectKeyboardToAppear();
          } catch (error) {
            console.error(error);
          } finally {
            done();
          }
        }}
        assert={({expect, state}) => {
          expect(state.text).to.be.equal('');
        }}
      />
      <TestCase.Example
        // Only "unless-editing" mode doesn't work on C_API
        modal
        itShould="use different clearButtonMode values">
        <TextInputWithText style={styles.textInput} clearButtonMode="always" />
        <Text>clearButtonMode="always"</Text>
        {
          /* Except Android */
          Platform.OS !== 'android' && (
            <>
              <TextInputWithText
                style={styles.textInput}
                clearButtonMode="while-editing"
              />
              <Text>clearButtonMode="while-editing"</Text>
              <TextInputWithText
                style={styles.textInput}
                clearButtonMode="unless-editing"
              />
              <Text>clearButtonMode="unless-editing"</Text>
            </>
          )
        }
        <TextInputWithText style={styles.textInput} clearButtonMode="never" />
        {/* You cannot see inputs with */}
        <Text style={{marginBottom: 200}}>clearButtonMode="never"</Text>
      </TestCase.Example>
      <TestCase.Example modal itShould="show selection start and end values">
        <TextSelectionChangeTest />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="show textinput with 'Selection' substring selected">
        <SelectionTest />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="show controlled textinput with 'Selection' substring selected">
        <ControlledSelectionTest />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="not show text context menu when long press">
        <ContextMenuHiddenTest />
      </TestCase.Example>
      <TestCase.Example modal itShould="select text on focus">
        <TextInput
          value="selectTextOnFocus"
          selectTextOnFocus
          style={styles.textInput}
        />
        <TextInput
          value={'selectTextOnFocus \n but multiline'}
          selectTextOnFocus
          multiline
          style={[styles.textInputBigger, {marginTop: 10}]}
        />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="allow to change the text input value via props">
        <TextInputValueSetProgrammatically />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="should show transparent TextInput on a red background">
        <View style={{backgroundColor: 'red'}}>
          <TextInput
            value="parent is red but I am transparent"
            style={{height: 40}}
          />
        </View>
      </TestCase.Example>
      <TestSuite name="style">
        {createSingleAndMultilineTest(
          'display light cyan background text input with larger line height than the reddish text input',
          (name, multiline) => {
            return (
              <TestCase.Example
                itShould={name}
                skip={{
                  android: false,
                  harmony: {
                    arkTs: true,
                    cAPI: multiline
                      ? "text should be vertically aligned (to match Android); spacing between wrapped lines isn't correct — those issues seem like a platform issue"
                      : false,
                  },
                }}>
                <TextInput
                  multiline={multiline}
                  defaultValue="lineHeight: 128"
                  style={{lineHeight: 128, backgroundColor: 'lightcyan'}}
                />
                <TextInput
                  defaultValue="lineHeight: undefined"
                  multiline={multiline}
                  style={{backgroundColor: 'mistyrose'}}
                />
              </TestCase.Example>
            );
          },
        )}
      </TestSuite>
      <TestCase.Manual
        modal
        itShould="trigger onEndEditing event after editing ends"
        initialState={false}
        arrange={({setState}) => (
          <TextInputWithText
            style={styles.textInput}
            autoFocus
            onEndEditing={() => setState(true)}
          />
        )}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase.Manual
        modal
        itShould="trigger onChange event after changing value"
        initialState={false}
        arrange={({setState}) => (
          <TextInputWithText onChange={() => setState(true)} />
        )}
        assert={({expect, state}) => {
          expect(state).to.be.true;
        }}
      />
      <TestCase.Example
        modal
        itShould="set cursorColor to red after pressing button (setNativeProps)">
        <SetNativePropsTest />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="select only Selection word (selectTextOnFocus && selection)">
        <TextInput
          style={styles.textInput}
          selection={{start: 4, end: 13}}
          value="TextSelectionTest"
          selectTextOnFocus
        />
      </TestCase.Example>
      <TestCase.Manual
        modal
        itShould="not trigger onChange event after changing value through state"
        initialState={{text: '', onChangeFired: false}}
        arrange={({setState, state}) => {
          return (
            <View>
              <TextInput
                style={styles.textInput}
                value={state.text}
                onChange={() => {
                  setState(prev => ({...prev, onChangeFired: true}));
                }}
              />
              <Button
                label="change text"
                onPress={() =>
                  setState(prev => ({...prev, text: prev.text + 'a'}))
                }
              />
            </View>
          );
        }}
        assert={({expect, state}) => {
          expect(state.onChangeFired).to.be.false;
          expect(state.text).to.not.be.equal('');
        }}
      />
      <TestCase.Example
        modal
        itShould="change the text input value programmatically on blur">
        <TextInputValueSetProgrammaticallyOnBlur />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="change the text input value programmatically when submitted">
        <TextInputValueSetProgrammaticallyWhenSubmitted />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="render textinput textinputs with different InputMode types">
        <TextInputInputModeTest />
      </TestCase.Example>
      <TestCase.Example
        modal
        itShould="render multiline with different InputMode types">
        <TextAreaInputModeTest />
      </TestCase.Example>
      <TestCase.Manual
        itShould="not trigger backspace event after pressing any other key"
        initialState={''}
        arrange={({setState}) => (
          <TextInput
            style={styles.textInput}
            value={''}
            onKeyPress={event => setState(event.nativeEvent.key)}
          />
        )}
        assert={({expect, state}) => {
          expect(state).to.not.be.equal('Backspace');
        }}
      />
    </TestSuite>
  );
}

const createSingleAndMultilineTest = (
  name: string,
  render: (name: string, multiline: boolean) => JSX.Element,
) => {
  return (
    <>
      {render(name, false)}
      {render(`${name} (multiline)`, true)}
    </>
  );
};

const SetNativePropsTest = () => {
  const ref = useRef<TextInput>(null);

  return (
    <View>
      <TextInput cursorColor={'blue'} ref={ref} />
      <Button
        label="setCursorColor"
        onPress={() => ref.current?.setNativeProps({cursorColor: 'red'})}
      />
    </View>
  );
};

const SelectionTest = () => {
  return (
    <View>
      <TextInput
        style={styles.textInput}
        value="TextSelectionTest"
        selection={{start: 4, end: 13}}
      />
      <TextInput
        style={[styles.textInputBigger, {marginTop: 10}]}
        value={'TextSelect\nionTest'}
        selection={{start: 4, end: 13}}
        multiline
      />
    </View>
  );
};

const ContextMenuHiddenTest = () => {
  return (
    <View>
      <TextInput
        style={styles.textInput}
        value="ContextMenuHiddenTest"
        contextMenuHidden={true}
      />
      <TextInput
        style={[styles.textInput, {marginTop: 5}]}
        value="ContextMenuHiddenTest_multiline"
        multiline
        contextMenuHidden={true}
      />
    </View>
  );
};

const TextSelectionChangeTest = () => {
  const [eventData, setEventData] = useState('');
  return (
    <View>
      <TextInput
        style={styles.textInput}
        onSelectionChange={event =>
          setEventData(JSON.stringify(event.nativeEvent.selection))
        }
      />
      <Text style={{marginVertical: 8}}>Selection {eventData}</Text>
    </View>
  );
};

const FocusTextInputTest = forwardRef<
  View,
  {setFocused: (value: boolean) => void}
>((props, buttonRef) => {
  const textInputRef = useRef<TextInput>(null);
  return (
    <View>
      <Button
        label="focus text input"
        onPress={() => textInputRef.current?.focus()}
        ref={buttonRef}
      />
      <TextInput
        onFocus={() => props.setFocused(true)}
        ref={textInputRef}
        style={styles.textInput}
      />
    </View>
  );
});

const TextInputKeyboardType = (props: TextInputProps) => {
  return (
    <>
      <Text>{props.keyboardType}</Text>
      <TextInput
        style={{...styles.textInputSmall, marginBottom: 10}}
        keyboardType={props.keyboardType}
        multiline={props.multiline}
      />
    </>
  );
};

const TextInputWithTextContent = (props: TextInputProps) => {
  const texts = [
    'Text content',
    'Hello, World!',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  ];
  const [index, setIndex] = useState(0);

  return (
    <>
      <TextInput {...props}>{texts[index]}</TextInput>
      <Button
        label="Toggle text"
        onPress={() => setIndex(i => (i + 1) % texts.length)}
      />
    </>
  );
};

const TextInputWithText = forwardRef<TextInput, TextInputProps>(
  (props, ref) => {
    const [text, onChangeText] = useState(props.defaultValue ?? '');

    const handleChangeText = (newText: string) => {
      if (props.onChangeText) {
        props.onChangeText(newText);
      }
      onChangeText(newText);
    };

    return (
      <>
        <Text style={styles.text}>{text}</Text>
        <TextInput
          ref={ref}
          {...props}
          onChangeText={handleChangeText}
          value={text}
        />
      </>
    );
  },
);
type CapitalizationType = 'none' | 'sentences' | 'words' | 'characters';
const AutoCapitalize = () => {
  const [state, setState] = useState<CapitalizationType>('none');
  const capitalizations: Array<CapitalizationType> = [
    'none',
    'sentences',
    'words',
    'characters',
  ];
  const toggleCapitalization = () => {
    const index = capitalizations.indexOf(state);
    setState(capitalizations[(index + 1) % capitalizations.length]);
  };
  return (
    <>
      <TextInputWithText style={styles.textInput} autoCapitalize={state} />
      <Button label="toggle capitalize mode" onPress={toggleCapitalization} />
      <Text>Capitalize mode: {state}</Text>
    </>
  );
};
const ReturnKeyTypeView = () => {
  const [state, setState] = useState<ReturnKeyType | ReturnKeyTypeAndroid>(
    'none',
  );
  const returnKey: Array<ReturnKeyType | ReturnKeyTypeAndroid> = [
    'none',
    'done',
    'go',
    'next',
    'search',
    'send',
    'none',
    'previous', //currently not supported by ArkUI
  ];
  const toggleReturnKey = () => {
    const index = returnKey.indexOf(state);
    setState(returnKey[(index + 1) % returnKey.length]);
  };
  return (
    <>
      <TextInputWithText style={styles.textInput} returnKeyType={state} />
      <Button label="toggle return key type" onPress={toggleReturnKey} />
      <Text>Return key: {state}</Text>
    </>
  );
};
const EnterKeyHintExample = () => {
  const [index, setIndex] = useState(0);
  const enterKey: Array<EnterKeyHintType | EnterKeyHintTypeAndroid> = [
    'done',
    'go',
    'next',
    'previous',
    'search',
    'send',
  ];
  const toggleEnterKey = () => {
    setIndex(i => (i + 1) % enterKey.length);
  };
  return (
    <>
      <TextInputWithText
        style={styles.textInput}
        enterKeyHint={enterKey[index]}
      />
      <Button label="toggle enter key type" onPress={toggleEnterKey} />
      <Text>Enter key: {enterKey[index]}</Text>
    </>
  );
};

const DefaultProps = forwardRef<TextInput, TextInputProps>((props, ref) => {
  // @ts-ignore
  TextInput.defaultProps = {
    value: props.defaultValue,
  };

  return <TextInput style={styles.textInput} ref={ref} {...props} />;
});

const TextInputValueSetProgrammatically = () => {
  const [value, setValue] = useState('Default Text Input Value');

  return (
    <View style={{height: 400}}>
      <View style={{marginBottom: 16}}>
        <Button
          label="Set 'Hello, World!' as text input value "
          onPress={() => setValue('Hello, World!')}
        />
        <Button
          label="Set 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' as text input value "
          onPress={() =>
            setValue('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
          }
        />
        <Button label="Clear text input value" onPress={() => setValue('')} />
      </View>
      <TextInput
        style={styles.textInput}
        defaultValue={value}
        value={value}
        onChangeText={setValue}
      />
    </View>
  );
};

const ControlledSelectionTest = () => {
  const [value, setValue] = useState('TextSelectionTest');
  const [valueM, setValueM] = useState('TextSelect\nionTest');

  return (
    <View>
      <TextInput
        style={styles.textInput}
        value={value}
        onChange={event => setValue(event.nativeEvent.text)}
        selection={{start: 4, end: 13}}
      />
      <TextInput
        style={[styles.textInputBigger, {marginTop: 10}]}
        value={valueM}
        onChange={event => setValueM(event.nativeEvent.text)}
        selection={{start: 4, end: 13}}
        multiline
      />
    </View>
  );
};

const TextInputValueSetProgrammaticallyOnBlur = () => {
  const [value, setValue] = useState("I'm the first text input.");

  return (
    <>
      <TextInput
        value={value}
        autoFocus
        onChangeText={text => setValue(text)}
        style={styles.textInput}
      />
      <TextInput
        onFocus={() => setValue('It works!')}
        multiline
        defaultValue="Click me and see if the value of the first text input has been changed."
        style={styles.textInputBigger}
      />
    </>
  );
};

const TextInputValueSetProgrammaticallyWhenSubmitted = () => {
  const [value, setValue] = useState('(1) Submit the text input.');

  return (
    <>
      <TextInput
        value={value}
        autoFocus
        onChangeText={text => setValue(text)}
        style={styles.textInput}
      />
      <Button
        label="(2) Press to change the text of the text input"
        onPress={() => setValue('(3) It works!')}
      />
    </>
  );
};

const TextAreaInputModeTest = () => {
  return (
    <View>
      <TextInput
        multiline
        inputMode={'none'}
        style={styles.textInput}
        placeholder={'none'}
      />
      <TextInput
        multiline
        inputMode={'text'}
        style={styles.textInput}
        placeholder={'text'}
      />
      <TextInput
        multiline
        inputMode={'decimal'}
        style={styles.textInput}
        placeholder={'decimal'}
      />
      <TextInput
        multiline
        inputMode={'numeric'}
        style={styles.textInput}
        placeholder={'numeric'}
      />
      <TextInput
        multiline
        inputMode={'tel'}
        style={styles.textInput}
        placeholder={'tel'}
      />
      <TextInput
        multiline
        inputMode={'search'}
        style={styles.textInput}
        placeholder={'search'}
      />
      <TextInput
        multiline
        inputMode={'email'}
        style={styles.textInput}
        placeholder={'email'}
      />
      <TextInput
        multiline
        inputMode={'url'}
        style={styles.textInput}
        placeholder={'url'}
      />
    </View>
  );
};

const TextInputInputModeTest = () => {
  return (
    <View>
      <TextInput
        inputMode={'none'}
        style={styles.textInput}
        placeholder={'none'}
      />
      <TextInput
        inputMode={'text'}
        style={styles.textInput}
        placeholder={'text'}
      />
      <TextInput
        inputMode={'decimal'}
        style={styles.textInput}
        placeholder={'decimal'}
      />
      <TextInput
        inputMode={'numeric'}
        style={styles.textInput}
        placeholder={'numeric'}
      />
      <TextInput
        inputMode={'tel'}
        style={styles.textInput}
        placeholder={'tel'}
      />
      <TextInput
        inputMode={'search'}
        style={styles.textInput}
        placeholder={'search'}
      />
      <TextInput
        inputMode={'email'}
        style={styles.textInput}
        placeholder={'email'}
      />
      <TextInput
        inputMode={'url'}
        style={styles.textInput}
        placeholder={'url'}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    backgroundColor: 'red',
  },
  text: {
    width: '100%',
    height: 40,
  },
  textInputSmall: {
    height: 20, // hack
    fontSize: 8,
    color: 'black',
    backgroundColor: 'rgb(245, 240, 211)',
    borderRadius: 20,
  },
  textInput: {
    height: 40, // hack
    fontSize: 16,
    color: 'black',
    backgroundColor: 'rgb(245, 240, 211)',
    borderRadius: 40,
  },
  textInputBigger: {
    height: 80, // hack
    fontSize: 16,
    color: 'black',
    backgroundColor: 'rgb(245, 240, 211)',
    borderRadius: 20,
  },
  multilineInput: {
    height: 80,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
});
