/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Smoke test for interop-61: verifies RN 0.61 listener removal methods.
 * Registers and immediately removes listeners on several modules.
 */
'use strict';

const React = require('react');
const {
  Text,
  View,
  AccessibilityInfo,
  AppState,
  BackHandler,
  Dimensions,
  Keyboard,
  Linking,
  NativeEventEmitter,
} = require('react-native');

function tryRemove(call) {
  try {
    call();
    return null;
  } catch (e) {
    return String(e && e.message ? e.message : e);
  }
}

function pushErrorIfPresent(errors, prefix, err) {
  if (err) {
    errors.push(`${prefix}: ${err}`);
  }
}

function pushSetupFailed(errors, moduleName, e) {
  errors.push(
    `${moduleName} setup failed: ${String(e && e.message ? e.message : e)}`,
  );
}

function testLegacyListener(options) {
  const {
    moduleName,
    target,
    addMethodName,
    removeMethodName,
    eventType,
    listener,
  } = options;
  const errors = [];
  try {
    const addMethod = target?.[addMethodName];
    const removeMethod = target?.[removeMethodName];
    if (typeof addMethod !== 'function' || typeof removeMethod !== 'function') {
      throw new Error('Missing listener methods');
    }
    const subscription = addMethod.call(target, eventType, listener);
    const removeError = tryRemove(() => {
      removeMethod.call(target, eventType, listener);
    });
    pushErrorIfPresent(errors, moduleName, removeError);
    const removeSubError = tryRemove(
      () =>
        subscription &&
        typeof subscription.remove === 'function' &&
        subscription.remove(),
    );
    pushErrorIfPresent(errors, `${moduleName} sub.remove()`, removeSubError);
  } catch (e) {
    pushSetupFailed(errors, moduleName, e);
  }
  return {moduleName, passed: errors.length === 0, errors};
}

function testNativeEventEmitter() {
  const moduleName = 'NativeEventEmitter';
  const errors = [];
  try {
    const fakeNativeModule = {
      addListener: (_eventType) => {},
      removeListeners: (_count) => {},
    };
    const emitter = new NativeEventEmitter(fakeNativeModule);
    const listener = () => {};
    const subscription = emitter.addListener('rnohTestEvent1', listener);
    // Verify removal via removeSubscription(subscription)
    const removeSubscriptionError = tryRemove(() => {
      emitter.removeSubscription(subscription);
    });
    pushErrorIfPresent(
      errors,
      `${moduleName} removeSubscription`,
      removeSubscriptionError,
    );
    // Verify removal via removeListener(eventType, listener)
    const secondSubscription = emitter.addListener('rnohTestEvent2', listener);
    const removeListenerError = tryRemove(() => {
      emitter.removeListener('rnohTestEvent2', listener);
    });
    pushErrorIfPresent(
      errors,
      `${moduleName} removeListener(eventType, listener)`,
      removeListenerError,
    );

    // Same listener registered twice for the same eventType
    const sameEventType = 'rnohSame';
    let sameCount = 0;
    const sameListener = () => {
      sameCount++;
    };
    emitter.addListener(sameEventType, sameListener);
    emitter.addListener(sameEventType, sameListener);
    try {
      emitter.emit(sameEventType);
    } catch (e) {
      pushSetupFailed(errors, moduleName, e);
    }
    if (sameCount !== 2) {
      errors.push(
        `${moduleName} same-listener first emit expected 2, got ${String(sameCount)}`,
      );
    }
    const removeSameOnceErr = tryRemove(() => {
      emitter.removeListener(sameEventType, sameListener);
    });
    pushErrorIfPresent(
      errors,
      `${moduleName} removeListener(same, listener)`,
      removeSameOnceErr,
    );
    try {
      emitter.emit(sameEventType);
    } catch (e) {
      pushSetupFailed(errors, moduleName, e);
    }
    if (sameCount !== 2) {
      errors.push(
        `${moduleName} same-listener second emit expected 2 (no listeners), got ${String(sameCount)}`,
      );
    }
  } catch (e) {
    pushSetupFailed(errors, moduleName, e);
  }
  return {moduleName, passed: errors.length === 0, errors};
}

const modulesToTest = [
  {
    moduleName: 'AccessibilityInfo',
    target: AccessibilityInfo,
    addMethodName: 'addEventListener',
    removeMethodName: 'removeEventListener',
    eventType: 'change',
    listener: () => {},
  },
  {
    moduleName: 'AppState',
    target: AppState,
    addMethodName: 'addEventListener',
    removeMethodName: 'removeEventListener',
    eventType: 'change',
    listener: () => {},
  },
  {
    moduleName: 'BackHandler',
    target: BackHandler,
    addMethodName: 'addEventListener',
    removeMethodName: 'removeEventListener',
    eventType: 'hardwareBackPress',
    listener: () => false,
  },
  {
    moduleName: 'Dimensions',
    target: Dimensions,
    addMethodName: 'addEventListener',
    removeMethodName: 'removeEventListener',
    eventType: 'change',
    listener: () => {},
  },
  {
    moduleName: 'Keyboard',
    target: Keyboard,
    addMethodName: 'addListener',
    removeMethodName: 'removeListener',
    eventType: 'keyboardDidShow',
    listener: () => {},
  },
  {
    moduleName: 'Linking',
    target: Linking,
    addMethodName: 'addEventListener',
    removeMethodName: 'removeEventListener',
    eventType: 'url',
    listener: () => {},
  },
];

function runLegacyListenerTests() {
  const results = [];
  modulesToTest.forEach((module) => {
    results.push(testLegacyListener(module));
  });
  results.push(testNativeEventEmitter());
  return results;
}

exports.title = '[RNOH] Legacy Listener Methods';
exports.description =
  'Smoke test for interop-61: verifies RN 0.61 listener removal methods.';
exports.examples = [
  {
    title:
      'Registers and immediately removes listeners on several modules via react-native 0.61 syntax.',
    render() {
      const results = runLegacyListenerTests();
      return (
        <View>
          {results.map((res, i) => (
            <View key={String(i)}>
              <Text style={{color: res.passed ? 'green' : 'red'}}>
                {res.passed
                  ? `pass: ${res.moduleName}`
                  : `fail: ${res.moduleName}`}
              </Text>
              {!res.passed &&
                Array.isArray(res.errors) &&
                res.errors.map((err, j) => (
                  <Text
                    key={`${String(i)}:${String(j)}`}
                    style={{color: 'red'}}>
                    {err}
                  </Text>
                ))}
            </View>
          ))}
        </View>
      );
    },
  },
];
