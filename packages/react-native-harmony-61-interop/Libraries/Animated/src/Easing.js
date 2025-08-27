/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Legacy deep import alias for RN 0.61 compatibility.
 * Maps react-native/Libraries/Animated/src/Easing -> ../Easing
 */

'use strict';

// Deep import alias for RN 0.61 projects that used
// `react-native/Libraries/Animated/src/Easing`.
// We forward directly to Harmony's Easing module.
const mod = require('@react-native-oh/react-native-harmony/Libraries/Animated/Easing');
module.exports = mod && mod.default ? mod.default : mod;
module.exports.default = module.exports;
