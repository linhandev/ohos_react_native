/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

/**
 * Interop‑61: restore RN 0.61 public `setOpacityTo(toValue, duration)` on Harmony 0.77+.
 *
 * Context:
 * - In RN 0.61, `TouchableOpacity` exposed public `setOpacityTo`; later it became private (`_setOpacityTo`) and disappeared from the ref.
 * - RNOH exports `TouchableOpacity` as a forwardRef; the class instance is not on the ref. We added a non‑breaking named export `.TouchableOpacity` (the class) via a small patch.
 *
 * Strategy:
 * - Prefer the class export and expose legacy `setOpacityTo` by delegating to `_setOpacityTo`.
 * - Keep a minimal ref passthrough so common view methods (`setNativeProps`, `measure`, `measureInWindow`) work; forward other unknown members to the underlying Animated.View via a small Proxy.
 * - Fallback: when the class export is unavailable, render the default forwardRef and surface `setOpacityTo` as a dev‑warning no‑op.
 *
 * Note: we do not reimplement `TouchableOpacity`; the shim is minimal and idempotent.
 */

const React = require('react');

const HarmonyTouchableModule = require('@react-native-oh/react-native-harmony/Libraries/Components/Touchable/TouchableOpacity');
const TouchableOpacityClass = HarmonyTouchableModule.TouchableOpacity; // the class (if patched)
const TouchableDefault = HarmonyTouchableModule; // the default export (forwardRef)

const Touchable = React.forwardRef((props, forwardedRef) => {
  const hostRef = React.useRef(null);
  const classRef = React.useRef(null);

  // Keep upstream behavior: pass the native ref down as `hostRef`
  // (used by Animated.View). Additionally, hold `classRef` to call setOpacityTo.
  React.useImperativeHandle(forwardedRef, () => {
    const host = hostRef.current;
    const klass = classRef.current;
    const api = {
      // RN 0.61 legacy API:
      setOpacityTo: (toValue, duration) => {
        if (klass && typeof klass._setOpacityTo === 'function') {
          klass._setOpacityTo(toValue, duration);
        } else if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn(
            '[interop-61] TouchableOpacity: setOpacityTo is a no-op (class export unavailable)',
          );
        }
      },
      // Common proxies to host ref:
      setNativeProps: host?.setNativeProps?.bind(host),
      measure: host?.measure?.bind(host),
      measureInWindow: host?.measureInWindow?.bind(host),
      // Debug/escape hatch:
      __nativeRef: host,
      __instanceRef: klass,
    };

    // Minimal proxy: forward unknown properties/methods to host ref
    // (the Animated.View ref that TouchableOpacity renders).
    if (typeof Proxy === 'function') {
      return new Proxy(api, {
        get(target, prop, receiver) {
          if (prop in target) {
            return Reflect.get(target, prop, receiver);
          }
          const currentHost = hostRef.current;
          if (!currentHost) return undefined;
          const value = currentHost[prop];
          return typeof value === 'function' ? value.bind(currentHost) : value;
        },
      });
    }

    return api;
  });

  if (TouchableOpacityClass) {
    return React.createElement(TouchableOpacityClass, {...props, hostRef, ref: classRef});
  }
  // Fallback: render default forwardRef (no class instance available)
  return React.createElement(TouchableDefault, {...props, ref: hostRef});
});

Touchable.displayName = 'TouchableOpacity';

module.exports = Touchable;
module.exports.default = module.exports;
