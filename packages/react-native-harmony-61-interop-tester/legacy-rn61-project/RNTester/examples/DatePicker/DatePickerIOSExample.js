/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

const React = require('react');
const {DatePickerIOS, StyleSheet, Text, View} = require('react-native');

type State = {|
  date: Date,
|};

type Props = {|
  // @rnoh: toLocaleDateString and toLocaleTimeString are currently unimplemented.
  // When this switch is off, dates are displayed, but without necessarily respecting the system locale.
  useLocaleDateFunctions: Boolean,
  children: (State, (Date) => void) => React.Node,
|};

class WithDatePickerData extends React.Component<Props, State> {
  state = {
    date: new Date(),
  };

  onDateChange = (date) => {
    this.setState({date: date});
  };

  dateToString = (date) =>
    this.props.useLocaleDateFunctions
      ? date.toLocaleDateString()
      : date.toDateString();

  timeToString = (date) => {
    const args = [
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    ];
    return this.props.useLocaleDateFunctions
      ? date.toLocaleTimeString(...args)
      : date.toTimeString(...args);
  };

  render() {
    return (
      <View>
        <WithLabel label="Value:">
          <Text testID="date-indicator">
            {this.dateToString(this.state.date)}
          </Text>
          <Text>&nbsp;</Text>
          <Text testID="time-indicator">
            {this.timeToString(this.state.date)}
          </Text>
        </WithLabel>
        {this.props.children(this.state, this.onDateChange)}
      </View>
    );
  }
}

type LabelProps = {|
  label: string,
  children: React.Node,
|};

class WithLabel extends React.Component<LabelProps> {
  render() {
    return (
      <View style={styles.labelContainer}>
        <View style={styles.labelView}>
          <Text style={styles.label}>{this.props.label}</Text>
        </View>
        {this.props.children}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textinput: {
    height: 26,
    width: 50,
    borderWidth: 0.5,
    borderColor: '#0f0f0f',
    padding: 4,
    fontSize: 13,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  labelView: {
    marginRight: 10,
    paddingVertical: 2,
  },
  label: {
    fontWeight: '500',
  },
});

exports.title = '<DatePickerIOS>';
exports.description = 'Select dates and times using the native UIDatePicker.';
exports.examples = [
  {
    title: 'Date and time picker',
    render: function (): React.Element<any> {
      return (
        <WithDatePickerData useLocaleDateFunctions={false}>
          {(state, onDateChange) => (
            <DatePickerIOS
              testID="date-and-time"
              date={state.date}
              mode="datetime"
              onDateChange={onDateChange}
            />
          )}
        </WithDatePickerData>
      );
    },
  },
  {
    title: 'Date only picker',
    render: function (): React.Element<any> {
      return (
        <WithDatePickerData useLocaleDateFunctions={false}>
          {(state, onDateChange) => (
            <DatePickerIOS
              testID="date-only"
              date={state.date}
              mode="date"
              onDateChange={onDateChange}
            />
          )}
        </WithDatePickerData>
      );
    },
  },
  {
    title: 'Time only picker, 20-minute interval',
    render: function (): React.Element<any> {
      return (
        <WithDatePickerData useLocaleDateFunctions={false}>
          {(state, onDateChange) => (
            <DatePickerIOS
              testID="time-with-interval"
              date={state.date}
              minuteInterval={20}
              mode="time"
              onDateChange={onDateChange}
            />
          )}
        </WithDatePickerData>
      );
    },
  },
  {
    title:
      '[RNOH][unimplemented] Display date using locale-dependent functions',
    render: function (): React.Element<any> {
      return (
        <WithDatePickerData useLocaleDateFunctions={true}>
          {(state, onDateChange) => (
            <DatePickerIOS
              testID="date-and-time-rnoh-locale"
              date={state.date}
              mode="datetime"
              onDateChange={onDateChange}
            />
          )}
        </WithDatePickerData>
      );
    },
  },
];
