/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

// Load polyfills as early as possible in RN bootstrap (InitializeCore)
require('../../polyfills/dateSlash');

// Delegate to Harmony's original setUpPlatform
module.exports = require('@react-native-oh/react-native-harmony/Libraries/Core/setUpPlatform');
