/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

/**
 * Interop-61: minimal shim restoring RN 0.61 .propTypes
 *
 * Context:
 * - RN 0.61 exposed `.propTypes` on components (e.g. Text.propTypes.style)
 * - RN 0.72+ removed `.propTypes` so accessing them can return undefined
 *   or crash on Harmony 0.77+
 *
 * Strategy:
 * - Attach stable no‑op .propTypes to components on demand, preserving referential equality
 *   for shared keys (e.g. Text.propTypes.style === ViewPropTypes.style) so legacy checks pass
 * - Keep the shim idempotent (multiple calls to ensurePropTypes do not overwrite)
 * - Don't re-implement original runtime validation, the goal is to only satisfy production builds
 *   and ensure no crashes when accessing .propTypes
 * - Attach only 'style' propTypes for now, if other fields are needed, we can add them later
 */

const getNoopPropType = require('./getNoopPropType');

function ensurePropTypes(target) {
  if (!target) {
    return target;
  }

  const base = target.propTypes || {};
  if (!Object.prototype.hasOwnProperty.call(base, 'style')) {
    const next = {...base, style: getNoopPropType('style')};
    try {
      target.propTypes = next;
    } catch {
      // Ignore if propTypes is read-only / not assignable
    }
  }
  return target;
}

exports.ensurePropTypes = ensurePropTypes;
