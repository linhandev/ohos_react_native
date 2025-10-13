/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//RNOH patch: We want to use the android patch of RNC. This could be done differently but that would result in a bigger patch and/or metro problems.
module.exports = require('./DrawerLayoutAndroid.android.js');
