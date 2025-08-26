/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

const {
  polyfillGlobal,
} = require('@react-native-oh/react-native-harmony/Libraries/Utilities/PolyfillFunctions');

// RNOH 0.61 PATCH: use polyfilled promise, so that done() is supported
polyfillGlobal('Promise', () => require('../Promise'));
