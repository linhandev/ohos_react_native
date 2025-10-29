/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const React = require('react');
const {Text, View, StyleSheet} = require('react-native');

const styles = StyleSheet.create({
  pass: {color: '#1a7f37'},
  fail: {color: '#d1242f'},
});

// Shared helpers
function analyzeDateInput(input) {
  let epochMs = NaN;
  try {
    epochMs = Date.parse(input);
  } catch (e) {
    epochMs = NaN;
  }

  let dateString = 'Invalid Date';
  try {
    const d = new Date(input);
    if (Number.isFinite(d.getTime())) {
      dateString = d.toISOString();
    }
  } catch (e) {}

  return {
    epochMs,
    dateString,
    okParse: Number.isFinite(epochMs),
    okDate: dateString !== 'Invalid Date',
  };
}

function renderRow([name, value, ok]) {
  return (
    <Text key={name} style={ok ? styles.pass : styles.fail}>
      {name}: {value}
    </Text>
  );
}

function evaluateParsing(label, input) {
  const {epochMs, dateString, okParse, okDate} = analyzeDateInput(input);
  const rows = [
    ['Date.parse', okParse ? String(epochMs) : 'NaN', okParse],
    ['new Date()', dateString, okDate],
  ];

  return (
    <View key={label} style={{marginTop: 8}}>
      <Text style={{fontWeight: '600'}}>{label}</Text>
      <Text>input: {input}</Text>
      {rows.map(renderRow)}
    </View>
  );
}

function evaluatePair(label, dashInput, slashInput) {
  const dash = analyzeDateInput(dashInput);
  const slash = analyzeDateInput(slashInput);

  const deltaMs =
    dash.okParse && slash.okParse ? slash.epochMs - dash.epochMs : NaN;
  const deltaHours = Number.isFinite(deltaMs) ? deltaMs / 3600000 : NaN;

  const rows = [
    ['- Date.parse(dash) ', String(dash.epochMs), dash.okParse],
    ['- Date.parse(slash)', String(slash.epochMs), slash.okParse],
    ['- new Date(dash) ', dash.dateString, dash.okDate],
    ['- new Date(slash)', slash.dateString, slash.okDate],
    [
      'Δ hours (slash - dash)',
      Number.isFinite(deltaHours) ? String(deltaHours) : 'NaN',
      Number.isFinite(deltaHours),
    ],
  ];

  return (
    <View key={label} style={{marginTop: 12}}>
      <Text style={{fontWeight: '600'}}>{label}</Text>
      <Text>dash input : {dashInput}</Text>
      <Text>slash input: {slashInput}</Text>
      {rows.map(renderRow)}
    </View>
  );
}

const DateParsingInteropTest = () => {
  const yyyy = '2024';
  const mm = '01';
  const dd = '15';

  const cases = [
    ['YYYY-MM-DD', '2024-01-15'],
    ['YYYY/MM/DD', '2024/01/15'],
    // ['YYYY-MM-DDTHH:mm:ssZ', '2024-01-15T12:34:56Z'],
    // ['YYYY/MM/DD HH:mm:ss', '2024/01/15 12:34:56'],  // unsupported at the moment
    // Template literals
    ['YYYY-MM-DD template literal', `${yyyy}-${mm}-${dd}`],
    ['YYYY/MM/DD template literal', `${yyyy}/${mm}/${dd}`],
    // ['TL YYYY-MM-DDTHH:mm:ssZ', `${yyyy}-${mm}-${dd}T12:34:56Z`],
    // ['TL YYYY/MM/DD HH:mm:ss', `${yyyy}/${mm}/${dd} 12:34:56`],
  ];

  const EngineBadge = () => {
    const engine = global.HermesInternal ? 'Hermes' : 'JSC/JSVM';
    return <Text style={{opacity: 0.5}}>Engine: {engine}</Text>;
  };
  const supportsSlashProbe = (() => {
    try {
      return !Number.isNaN(Date.parse('2000/01/02'));
    } catch (e) {
      return false;
    }
  })();

  return (
    <View style={{padding: 12}}>
      <EngineBadge />
      <Text style={{opacity: 0.5}}>
        Slash supported (probe 2000/01/02): {String(supportsSlashProbe)}
      </Text>
      <Text style={{fontWeight: '600'}}>[RNOH] Date parsing behavior</Text>
      <Text>Compare parsing of dash (-) vs slash (/) date formats.</Text>
      {cases.map(([label, input]) => evaluateParsing(label, input))}
      {evaluatePair(
        'Dash vs Slash (pair comparison)',
        '2024-01-15',
        '2024/01/15',
      )}
    </View>
  );
};

exports.title = '[RNOH] Date parsing behavior';
exports.description =
  'Compares Date.parse and new Date for YYYY-MM-DD vs YYYY/MM/DD.';
exports.examples = [
  {
    title: 'Run',
    render() {
      return <DateParsingInteropTest />;
    },
  },
];
