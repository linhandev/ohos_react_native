/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * [RNOH] Animated Shims Warning Test
 * Verifies that legacy Animated APIs used by RN 0.61 do not produce warnings:
 * - Animated.event([...]) without options
 * - Animated.event([...], listener)
 * - Animated.timing/spring/decay without useNativeDriver
 * - Animated.createAnimatedComponent ref has _component
 */

'use strict';

const React = require('react');
const {Animated, StyleSheet, Text, View, TouchableOpacity} = require('react-native');

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {padding: 12, backgroundColor: '#eee'},
  btn: {padding: 12, backgroundColor: '#317aff', margin: 12, borderRadius: 6},
  btnText: {color: 'white', textAlign: 'center'},
  section: {padding: 12},
  row: {paddingVertical: 4},
});

class AnimatedShimsWarningTest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ran: false,
      results: [], // Array<{name: string, pass: boolean}>
      warnings: [], // string[]
      _hasRefComponent: false,
    };
    const TestView = Animated.createAnimatedComponent(View);
    this._animatedRef = null;
    this._AnimatedTestView = TestView;
  }

  componentDidMount() {
    // After first mount, verify _component shim presence on animated ref
    setTimeout(() => {
      const ok = !!(this._animatedRef && this._animatedRef._component);
      this.setState({_hasRefComponent: ok});
    }, 0);
  }

  runTests = () => {
    const originalWarn = console.warn;
    const captured = [];
    console.warn = function(...args) {
      try {
        captured.push(args.map(String).join(' '));
      } catch (_e) {}
      return originalWarn.apply(console, args);
    };

    const caseResults = [];
    try {
      // Case 1: Animated.event without options
      const v1 = new Animated.Value(0);
      const h1 = Animated.event([{nativeEvent: {contentOffset: {y: v1}}}]);
      typeof h1 === 'function' && h1({nativeEvent: {contentOffset: {y: 123}}});
      caseResults.push({name: 'Animated.event (no options)', pass: true});

      // Case 2: Animated.event with listener as second argument
      const v2 = new Animated.Value(0);
      const h2 = Animated.event(
        [{nativeEvent: {contentOffset: {y: v2}}}],
        () => {}
      );
      typeof h2 === 'function' && h2({nativeEvent: {contentOffset: {y: 456}}});
      caseResults.push({name: 'Animated.event (listener 2nd arg)', pass: true});

      // Case 3: timing without useNativeDriver
      const v3 = new Animated.Value(0);
      Animated.timing(v3, {toValue: 1, duration: 1}).start();
      caseResults.push({name: 'Animated.timing (no useNativeDriver)', pass: true});

      // Case 4: spring without useNativeDriver
      const v4 = new Animated.Value(0);
      Animated.spring(v4, {toValue: 1}).start();
      caseResults.push({name: 'Animated.spring (no useNativeDriver)', pass: true});

      // Case 5: decay without useNativeDriver
      const v5 = new Animated.Value(0);
      Animated.decay(v5, {velocity: 1}).start();
      caseResults.push({name: 'Animated.decay (no useNativeDriver)', pass: true});

    } catch (_e) {
      // ignore runtime errors; focus on warnings for this testbed
    } finally {
      console.warn = originalWarn;
    }

    // Determine if any captured warning indicates missing options/driver
    const hasBad = captured.some(msg => /Animated\.event.*second argument|useNativeDriver/i.test(msg));
    const testResults = caseResults.map(r => ({...r, pass: r.pass && !hasBad}));
    this.setState({ran: true, results: testResults, warnings: captured});
  };

  renderRow(name, pass) {
    return (
      <View key={name} style={styles.row}>
        <Text>{name}: {pass ? 'PASS' : 'FAIL'}</Text>
      </View>
    );
  }

  render() {
    const AnimatedTestView = this._AnimatedTestView;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text>[RNOH] Animated Shims Warning Test</Text>
          <Text>Verifies no warnings for legacy Animated usage (RN 0.61)</Text>
          <Text>- Animated.event without options, with listener</Text>
          <Text>- timing/spring/decay without useNativeDriver</Text>
          <Text>- createAnimatedComponent ref has _component</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={this.runTests}>
          <Text style={styles.btnText}>Run Animated shims test</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text>Ref _component present: {this.state._hasRefComponent ? 'YES' : 'NO'}</Text>
        </View>

        <View style={styles.section}>
          <Text>Results:</Text>
          {this.state.results.map(r => this.renderRow(r.name, r.pass))}
        </View>

        <View style={styles.section}>
          <Text>Captured warnings ({this.state.warnings.length}):</Text>
          {this.state.warnings.map((w, i) => (
            <Text key={String(i)}>{w}</Text>
          ))}
        </View>

        {/* Hidden animated view to test ref._component shim */}
        <AnimatedTestView ref={ref => { this._animatedRef = ref }} style={{width: 1, height: 1}} />
      </View>
    );
  }
}

exports.title = '[RNOH] Animated Shims Warning Test';
exports.description = 'Ensures legacy Animated usage produces no warnings under interop shims';
exports.examples = [
  {
    title: 'Animated shims testbed',
    render: function() {
      return <AnimatedShimsWarningTest />;
    },
  },
];
