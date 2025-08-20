/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Simple smoke test for legacy removeEventListener/removeListener interop.
 * Registers and immediately removes listeners on several modules.
 */
'use strict';

const React = require('react');
const {
  Text,
  View,
  Dimensions,
  AppState,
  Keyboard,
  Linking,
  AccessibilityInfo,
  AppRegistry,
  BackHandler,
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

function testAccessibilityInfo(errors) {
  const accHandler = () => {};
  try {
    const accSub = AccessibilityInfo.addEventListener('change', accHandler);
    const errA = tryRemove(() =>
      AccessibilityInfo.removeEventListener('change', accHandler),
    );
    pushErrorIfPresent(errors, 'AccessibilityInfo', errA);
    const errAb = tryRemove(
      () => accSub && typeof accSub.remove === 'function' && accSub.remove(),
    );
    pushErrorIfPresent(errors, 'AccessibilityInfo sub.remove()', errAb);
  } catch (e) {
    pushSetupFailed(errors, 'AccessibilityInfo', e);
  }
}

function testDimensions(errors) {
  const dimHandler = () => {};
  try {
    const dimSub = Dimensions.addEventListener('change', dimHandler);
    const err1 = tryRemove(() =>
      Dimensions.removeEventListener('change', dimHandler),
    );
    pushErrorIfPresent(errors, 'Dimensions', err1);
    const err1b = tryRemove(
      () => dimSub && typeof dimSub.remove === 'function' && dimSub.remove(),
    );
    pushErrorIfPresent(errors, 'Dimensions sub.remove()', err1b);
  } catch (e) {
    pushSetupFailed(errors, 'Dimensions', e);
  }
}

function testAppState(errors) {
  const appHandler = () => {};
  try {
    const appSub = AppState.addEventListener('change', appHandler);
    const err2 = tryRemove(() =>
      AppState.removeEventListener('change', appHandler),
    );
    pushErrorIfPresent(errors, 'AppState', err2);
    const err2b = tryRemove(
      () => appSub && typeof appSub.remove === 'function' && appSub.remove(),
    );
    pushErrorIfPresent(errors, 'AppState sub.remove()', err2b);
  } catch (e) {
    pushSetupFailed(errors, 'AppState', e);
  }
}

function testBackHandler(errors) {
  const backHandler = () => false;
  try {
    const bhSub = BackHandler.addEventListener(
      'hardwareBackPress',
      backHandler,
    );
    const errBH = tryRemove(() =>
      BackHandler.removeEventListener('hardwareBackPress', backHandler),
    );
    pushErrorIfPresent(errors, 'BackHandler', errBH);
    const errBHb = tryRemove(
      () => bhSub && typeof bhSub.remove === 'function' && bhSub.remove(),
    );
    pushErrorIfPresent(errors, 'BackHandler sub.remove()', errBHb);
  } catch (e) {
    pushSetupFailed(errors, 'BackHandler', e);
  }
}

function testKeyboard(errors) {
  const kbHandler = () => {};
  try {
    const kbSub = Keyboard.addListener('keyboardDidShow', kbHandler);
    const err3 = tryRemove(() =>
      Keyboard.removeListener('keyboardDidShow', kbHandler),
    );
    pushErrorIfPresent(errors, 'Keyboard', err3);
    const err3b = tryRemove(
      () => kbSub && typeof kbSub.remove === 'function' && kbSub.remove(),
    );
    pushErrorIfPresent(errors, 'Keyboard sub.remove()', err3b);
  } catch (e) {
    pushSetupFailed(errors, 'Keyboard', e);
  }
}

function testLinking(errors) {
  const linkHandler = () => {};
  try {
    const linkSub = Linking.addEventListener('url', linkHandler);
    const err4 = tryRemove(() =>
      Linking.removeEventListener('url', linkHandler),
    );
    pushErrorIfPresent(errors, 'Linking', err4);
    const err4b = tryRemove(
      () => linkSub && typeof linkSub.remove === 'function' && linkSub.remove(),
    );
    pushErrorIfPresent(errors, 'Linking sub.remove()', err4b);
  } catch (e) {
    pushSetupFailed(errors, 'Linking', e);
  }
}

function runLegacyListenerTests() {
  const errors = [];
  testAccessibilityInfo(errors);
  testDimensions(errors);
  testAppState(errors);
  testBackHandler(errors);
  testKeyboard(errors);
  testLinking(errors);
  return errors;
}

exports.title = 'LegacyListeners Smoke Test';
exports.description = 'Verifies removeEventListener/removeListener exist and work.';
exports.examples = [
  {
    title: 'Run',
    render() {
      const errors = runLegacyListenerTests();
      const ok = errors.length === 0;
      return (
        <View>
          <Text>{ok ? 'OK - legacy listeners registered and removed correctly' : 'FAIL'}</Text>
          {!ok && errors.map((e, i) => (
            <Text key={String(i)}>{e}</Text>
          ))}
        </View>
      );
    },
  },
];
