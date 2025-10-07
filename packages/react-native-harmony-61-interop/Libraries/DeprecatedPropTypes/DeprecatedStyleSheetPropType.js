/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

/**
 * Deep-import alias for RN 0.61 compatibility
 */

const getNoopPropType = require('../../compat/getNoopPropType');

module.exports = getNoopPropType('StyleSheetPropType');
module.exports.default = module.exports;
