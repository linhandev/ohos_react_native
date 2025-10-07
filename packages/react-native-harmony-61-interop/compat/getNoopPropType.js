/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

/**
 * Interop-61: helper for creating no-op PropType functions
 *
 * Returns a singleton no-op PropType function with `.isRequired`,
 * mimicking the shape of legacy PropTypes.
 *
 * Strategy:
 * - Don't re-implement original dev-time PropTypes validation, the goal is to only satisfy
 *   production builds and ensure no crashes when importing legacy PropTypes.
 * - Each distinct `name` gets its own unique instance, so that
 *   `ColorPropType !== EdgeInsetsPropType` (same behavior as RN 0.61).
 * - Within the same `name`, all imports (top-level getter and deep-import) share
 *   the exact same reference. This preserves referential equality checks such as:
 *     require('react-native').ColorPropType
 *       === require('react-native/Libraries/DeprecatedPropTypes/DeprecatedColorPropType')
 */

function createNoopPropType() {
  const fn = () => null;
  fn.isRequired = fn;
  return fn;
}

const noopPropTypeByName = new Map();

function getNoopPropType(name) {
  if (!noopPropTypeByName.has(name)) {
    noopPropTypeByName.set(name, createNoopPropType());
  }
  return noopPropTypeByName.get(name);
}

module.exports = getNoopPropType;
module.exports.default = module.exports;
