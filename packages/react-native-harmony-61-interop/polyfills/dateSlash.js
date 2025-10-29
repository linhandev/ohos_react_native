/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

// Polyfill for parsing 'YYYY/MM/DD' as local time (matching legacy JSC).
// Enabled by importing this module.

(function () {
  try {
    const {
      polyfillGlobal,
    } = require('@react-native-oh/react-native-harmony/Libraries/Utilities/PolyfillFunctions');

    const OrigDate = global.Date;

    // Feature probe: if engine already parses slashes, do nothing
    const supportsSlash = !Number.isNaN(OrigDate.parse('2000/01/02'));
    if (supportsSlash) {
      return;
    }

    function parseSlash(s) {
      if (typeof s !== 'string') {
        return null;
      }
      const m = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(s);
      if (!m) {
        return null;
      }
      const y = parseInt(m[1], 10);
      const mo = parseInt(m[2], 10);
      const d = parseInt(m[3], 10);
      // Local midnight to mirror JSC behavior for 'YYYY/MM/DD'
      return new OrigDate(y, mo - 1, d).getTime();
    }

    polyfillGlobal('Date', () => {
      const origParse = OrigDate.parse;

      // Constructor wrapper
      const PatchedDate = function DatePolyfill(...args) {
        // If called with `new`, construct
        if (new.target) {
          if (args.length === 1 && typeof args[0] === 'string') {
            const n = parseSlash(args[0]);
            if (n != null) {
              return new OrigDate(n);
            }
          }
          return new OrigDate(...args);
        }
        // If called as a function, behave like native Date()
        return OrigDate.apply(OrigDate, args);
      };

      PatchedDate.prototype = OrigDate.prototype;

      // Copy static properties (UTC, now, parse, etc.)
      Object.getOwnPropertyNames(OrigDate).forEach(k => {
        if (!(k in PatchedDate)) {
          PatchedDate[k] = OrigDate[k];
        }
      });

      // Patch parse to support only exact 'YYYY/MM/DD'; delegate otherwise
      PatchedDate.parse = function (s) {
        const n = parseSlash(s);
        if (n != null) {
          return n;
        }
        return origParse(s);
      };

      return PatchedDate;
    });
  } catch (e) {
    // Fail closed; never crash app due to polyfill
    try {
      const msg =
        '[dateSlash] Failed to initialize Date polyfill: ' +
        String(e && e.message ? e.message : e);
      console.warn(msg);
    } catch (_) {}
  }
})();
