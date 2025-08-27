/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Wrap Harmony 0.77 Animated to restore RN 0.61-friendly call patterns,
// especially around Animated.event where the second options argument
// used to be optional or a listener function.

const React = require('react');
const Animated77 = require('@react-native-oh/react-native-harmony/Libraries/Animated/Animated').default;

function withAnimatedEventShim(baseEvent) {
  return function wrappedEvent(mapping, optionsOrListener, legacyThirdOptions) {
    // RN 0.61 often called Animated.event(mapping) without options.
    // Ensure options exist to avoid warnings and keep semantics.
    if (typeof optionsOrListener === 'function') {
      // Animated.event(mapping, listener)
      return baseEvent(mapping, {useNativeDriver: false, listener: optionsOrListener});
    }
    if (optionsOrListener == null && legacyThirdOptions && typeof legacyThirdOptions === 'object') {
      // Tolerate historical signatures with a third config arg.
      return baseEvent(mapping, legacyThirdOptions);
    }
    const config = optionsOrListener ?? {useNativeDriver: false};
    return baseEvent(mapping, config);
  };
}

function withAnimationConfigShim(baseFn) {
  return function wrappedAnimation(value, config) {
    const cfg = config ?? {};
    if (typeof cfg.useNativeDriver === 'undefined') {
      cfg.useNativeDriver = false;
    }
    return baseFn(value, cfg);
  };
}

// Attach legacy `_component` access to refs returned from Animated components.
function attachLegacyComponentGetter(node) {
  if (!node || typeof node !== 'object' || ('_component' in node)) {
    return node;
  }
  try {
    Object.defineProperty(node, '_component', {
      configurable: true,
      get: () => node,
    });
  } catch (_e) {
    // ignore if defineProperty fails
  }
  return node;
}

function withRefShim(Component) {
  if (!Component) {
    return Component;
  }
  return React.forwardRef((props, ref) => {
    const setRef = node => {
      const finalNode = attachLegacyComponentGetter(node);
      if (typeof ref === 'function') {
        ref(finalNode);
      } else if (ref && typeof ref === 'object') {
        ref.current = finalNode;
      }
    };
    return React.createElement(Component, {...props, ref: setRef});
  });
}

const baseEvent =
  Animated77 && typeof Animated77.event === 'function'
    ? Animated77.event
    : null;
const baseTiming =
  Animated77 && typeof Animated77.timing === 'function'
    ? Animated77.timing
    : null;
const baseSpring =
  Animated77 && typeof Animated77.spring === 'function'
    ? Animated77.spring
    : null;
const baseDecay =
  Animated77 && typeof Animated77.decay === 'function'
    ? Animated77.decay
    : null;

const AnimatedWrapped = {
  // Spread base surface and override only `event`.
  ...Animated77,
  event: baseEvent ? withAnimatedEventShim(baseEvent) : undefined,
  // RN 0.61 compatibility: default missing useNativeDriver to false
  // to avoid warnings in legacy code paths.
  timing: baseTiming ? withAnimationConfigShim(baseTiming) : Animated77 && Animated77.timing,
  spring: baseSpring ? withAnimationConfigShim(baseSpring) : Animated77 && Animated77.spring,
  decay: baseDecay ? withAnimationConfigShim(baseDecay) : Animated77 && Animated77.decay,
};

// Ensure legacy `_component` is available on common Animated components
// and any user-created animated components via createAnimatedComponent.
AnimatedWrapped.createAnimatedComponent = function(Component) {
  const Base = (Animated77 && Animated77.createAnimatedComponent)
    ? Animated77.createAnimatedComponent(Component)
    : null;
  return withRefShim(Base || Component);
};

['View', 'Image', 'ScrollView', 'SectionList', 'FlatList', 'Text'].forEach(key => {
  if (AnimatedWrapped[key]) {
    AnimatedWrapped[key] = withRefShim(AnimatedWrapped[key]);
  }
});

// Export in both CommonJS and compat default form.
module.exports = AnimatedWrapped;
module.exports.default = AnimatedWrapped;
