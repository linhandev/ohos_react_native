/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

/**
 * [RNOH] TouchableOpacity interop test
 *
 * Goals
 * - Validate legacy `ref.setOpacityTo(toValue, duration)` availability and callability
 *   when running via interop shim on Harmony.
 * - Compare press feedback semantics (activeOpacity on press, style opacity on release)
 *   against RN 0.61.
 * - Verify ref passthrough/proxy behavior for common native methods (measure, measureInWindow,
 *   setNativeProps) without generating warnings.
 *
 * Notes
 * - Live opacity readout is shown only when the inner class instance is available on Harmony
 *   (via `__instanceRef`). On RN 0.61 Android this is not present, so we show `n/a`.
 */

const React = require('react');
const {useEffect, useRef, useState} = React;
const {View, Text, TouchableOpacity} = require('react-native');

exports.title = '[RNOH] TouchableOpacity interop test';
exports.description =
  'Validates legacy setOpacityTo and native proxies on TouchableOpacity.';
exports.examples = [
  {
    title: 'Run checks',
    render() {
      function Screen() {
        const ref = useRef(null);
        const parentRef = useRef(null);
        const [log, setLog] = useState([]);
        const [pressed, setPressed] = useState(false);
        const [opacity, setOpacity] = useState(null);
        const [opacityTarget, setOpacityTarget] = useState(0.5);

        const append = (ok, message) =>
          setLog((prev) => prev.concat({ok, message: String(message)}));

        // Helper: unify try/catch and logging for callable checks (keeps tests concise)
        function tryInvoke(exists, invoke, okMessage, failPrefix) {
          try {
            if (exists) {
              invoke();
              append(true, okMessage);
            }
          } catch (e) {
            const msg = String(e && e.message ? e.message : e);
            append(false, `${failPrefix} ${msg}`);
          }
        }

        // Subscribe once and run existence tests once
        useEffect(() => {
          // Subscribe to internal Animated.Value when available (Harmony class path)
          // Why: show a live opacity readout to help verify press feedback and programmatic value
          let listenerId = null;
          try {
            const inst = ref.current && ref.current.__instanceRef;
            const anim = inst && inst.state && inst.state.anim;
            if (anim && typeof anim.addListener === 'function') {
              // Initialize current value
              try {
                if (typeof anim.__getValue === 'function') {
                  setOpacity(anim.__getValue());
                }
              } catch (_) {}
              listenerId = anim.addListener(({value}) => {
                setOpacity(value);
              });
            }
          } catch (_) {}

          // 1) Legacy API: setOpacityTo must exist in interop; flag missing as failure
          const hasSetOpacityTo =
            ref.current && typeof ref.current.setOpacityTo === 'function';
          if (hasSetOpacityTo) {
            tryInvoke(
              true,
              () => ref.current.setOpacityTo(opacityTarget, 100),
              `Legacy API setOpacityTo(${opacityTarget.toFixed(2)}) exists and is callable`,
              'Legacy API setOpacityTo threw:',
            );
          } else {
            append(false, 'Legacy API setOpacityTo is missing');
          }

          // 2) Native proxy: setNativeProps should be callable
          tryInvoke(
            ref.current && typeof ref.current.setNativeProps === 'function',
            () => ref.current.setNativeProps({testID: 'interop-touchable'}),
            'Native proxy setNativeProps exists and is callable',
            'Native proxy setNativeProps threw:',
          );

          // 3) Native proxy: measure should be callable
          tryInvoke(
            ref.current && typeof ref.current.measure === 'function',
            () => ref.current.measure(() => {}),
            'Native proxy measure exists and is callable',
            'Native proxy measure threw:',
          );

          // 4) Native proxy: measureInWindow exists and callable (Android/Harmony)
          tryInvoke(
            ref.current && typeof ref.current.measureInWindow === 'function',
            () => ref.current.measureInWindow(() => {}),
            'Native proxy measureInWindow exists and is callable',
            'Native proxy measureInWindow threw:',
          );

          // 5) Proxy passthrough: setNativeProps(style) should work without warnings
          tryInvoke(
            ref.current && typeof ref.current.setNativeProps === 'function',
            () => ref.current.setNativeProps({style: {borderColor: 'green'}}),
            'Proxy passthrough setNativeProps(style) is callable',
            'Proxy passthrough setNativeProps(style) threw:',
          );
          return () => {
            try {
              const inst = ref.current && ref.current.__instanceRef;
              const anim = inst && inst.state && inst.state.anim;
              if (
                anim &&
                listenerId &&
                typeof anim.removeListener === 'function'
              ) {
                anim.removeListener(listenerId);
              }
            } catch (_) {}
          };
        }, []);

        // Apply programmatic opacity on target change without duplicating existence logs
        useEffect(() => {
          try {
            if (ref.current && typeof ref.current.setOpacityTo === 'function') {
              ref.current.setOpacityTo(opacityTarget, 100);
            }
          } catch (_) {}
        }, [opacityTarget]);

        return (
          <View ref={parentRef} style={{gap: 8, padding: 12}}>
            <Text>Instructions:</Text>
            <Text>
              - Pick opacity using the buttons below; the blue box should update
            </Text>
            <Text>
              - Tap and hold the blue box: it should dim to exactly
              activeOpacity (0.2)
            </Text>
            <Text>
              - Release: it returns to the element's style opacity (default 1.0)
            </Text>
            <View style={{marginVertical: 8}}>
              <Text>
                Target opacity (set via setOpacityTo):{' '}
                {opacityTarget.toFixed(2)}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  marginTop: 8,
                }}>
                {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map(
                  (v) => (
                    <TouchableOpacity
                      key={String(v)}
                      onPress={() => setOpacityTarget(v)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderWidth: 1,
                        borderColor: '#555',
                        marginRight: 8,
                        marginBottom: 8,
                        backgroundColor:
                          Math.abs(opacityTarget - v) < 1e-6
                            ? '#e0f7ff'
                            : 'transparent',
                      }}>
                      <Text>{v.toFixed(1)}</Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </View>
            <TouchableOpacity
              ref={ref}
              activeOpacity={0.2}
              onPressIn={() => setPressed(true)}
              onPressOut={() => setPressed(false)}
              style={{padding: 16, borderWidth: 1, borderColor: 'blue'}}>
              <Text style={{color: 'blue'}}>Press and hold me</Text>
            </TouchableOpacity>
            <Text>Pressed: {pressed ? 'yes' : 'no'}</Text>
            <Text>
              Current opacity:{' '}
              {opacity === null || opacity === undefined
                ? 'n/a'
                : opacity.toFixed(3)}
            </Text>
            <View style={{marginTop: 8}}>
              {log.map((entry, i) => (
                <Text
                  key={String(i)}
                  style={{
                    color: entry.ok ? 'green' : 'red',
                    marginBottom: 4,
                  }}>
                  {`${i + 1}. ${entry.message}`}
                </Text>
              ))}
            </View>
          </View>
        );
      }

      return React.createElement(Screen);
    },
  },
];
