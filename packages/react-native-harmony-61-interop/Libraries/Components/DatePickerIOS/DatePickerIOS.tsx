/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Implements the DatePickerIOS component which is removed from newer RN releases.
 * Main functionality is delegated to native components:
 *  - [TimePicker](https://developer.huawei.com/consumer/en/doc/harmonyos-references/ts-basic-components-timepicker)
 *  - [DatePicker](https://developer.huawei.com/consumer/en/doc/harmonyos-references/ts-basic-components-datepicker)
 *
 * There is no direct equivalent for mode='datetime', so we construct one by rendering the DatePicker and TimePicker side-by-side.
 * A few properties are not supported due to the above native components' limitations, and overall platform limitations.
 *
 * These include:
 *
 *  - [minuteInterval](https://reactnative-archive-august-2023.netlify.app/docs/0.61/datepickerios#minuteinterval)
 *    TimePicker provides no direct way to set the minute interval. A hand-rolled component can support this easily,
 *    but it would take too much effort to have it provide all the other functionalities already present in TimePicker, like localization.
 *
 *  - [locale](https://reactnative-archive-august-2023.netlify.app/docs/0.61/datepickerios#locale)
 *    Expanding on the previous point, TimePicker uses the system locale and does not allow overriding it.
 *    Supporting multiple locales reliably for any component takes considerable effort, and requires active maintenance.
 *    Creating a custom TimePicker with this in mind does not seem worthwile.
 *
 *  - [timeZoneOffsetInMinutes](https://reactnative-archive-august-2023.netlify.app/docs/0.61/datepickerios#timezoneoffsetinminutes)
 *    This ties into mentioned localization issues. Standard JS Date APIs do not provide any direct timezone support,
 *    and the [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
 *    for HarmonyOS are not stable yet (see e.g. Date..toLocaleDateString() returning 'dateFormat not implemented'. This is squarely outside the scope of implementing DatePickerIOS).
 *    Any naive implementation of timezone offsets like adding/subtracting minutes is too brittle to be considered.
 */

import RNDatePickerNative from '../../../src/private/specs/components/DatePickerNativeComponent';
import RNTimePickerNative from '../../../src/private/specs/components/TimePickerNativeComponent';
import type {NativeProps as NativePickerProps} from '../../../src/private/specs/components/DatePickerNativeComponent';
import {forwardRef, useState} from 'react';
import {ViewProps, NativeMethods, View} from 'react-native';
import nullthrows from 'nullthrows';
import {NativeSyntheticEvent} from '@react-native-oh/react-native-harmony';

// #region types
// For developer convenience

// NOTE[RNOH]: Removed SyntheticEvent wrapper
type Event = Readonly<{
  timestamp: number;
}>;

type DateTimePickerEvent = NativeSyntheticEvent<
  Readonly<{
    timestamp: number;
  }>
>;

type Props = Readonly<
  ViewProps & {
    /**
     * The currently selected date.
     */
    date?: Date;

    /**
     * Provides an initial value that will change when the user starts selecting
     * a date. It is useful for simple use-cases where you do not want to deal
     * with listening to events and updating the date prop to keep the
     * controlled state in sync. The controlled state has known bugs which
     * causes it to go out of sync with native. The initialDate prop is intended
     * to allow you to have native be source of truth.
     */
    initialDate?: Date;

    /**
     * The date picker locale.
     */
    locale?: string;

    /**
     * Maximum date.
     *
     * Restricts the range of possible date/time values.
     */
    maximumDate?: Date;

    /**
     * Minimum date.
     *
     * Restricts the range of possible date/time values.
     */
    minimumDate?: Date;

    /**
     * The interval at which minutes can be selected.
     */
    minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;

    /**
     * The date picker mode.
     */
    mode?: 'date' | 'time' | 'datetime';

    /**
     * Date change handler.
     *
     * This is called when the user changes the date or time in the UI.
     * The first and only argument is an Event. For getting the date the picker
     * was changed to, use onDateChange instead.
     */
    onChange?: (event: Event) => void;

    /**
     * Date change handler.
     *
     * This is called when the user changes the date or time in the UI.
     * The first and only argument is a Date object representing the new
     * date and time.
     */
    onDateChange: (date: Date) => void;

    /**
     * Timezone offset in minutes.
     *
     * By default, the date picker will use the device's timezone. With this
     * parameter, it is possible to force a certain timezone offset. For
     * instance, to show times in Pacific Standard Time, pass -7 * 60.
     */
    timeZoneOffsetInMinutes?: number;
  }
>;

// #endregion

function dateToMilliseconds(date?: Date): number | undefined {
  return date?.getTime();
}

const DateTimePickerIOS = forwardRef(function DateTimePickerIOS(
  props: NativePickerProps,
  ref: React.Ref<NativeMethods>,
) {
  const {onChange, date, style, ...nativeProps} = props;
  const [selectedDate, setSelectedDate] = useState(date);

  // The two pickers are very likely to go out of sync,
  // so when gluing them together we have to make
  // sure the signaled date is synced manually
  const onDateChange = (event: DateTimePickerEvent) => {
    const timestamp = event.nativeEvent.timestamp;
    const pickerDate = new Date(timestamp);

    const oldDate = new Date(selectedDate);
    const newDate = new Date(
      pickerDate.getFullYear(),
      pickerDate.getMonth(),
      pickerDate.getDay(),
      oldDate.getHours(),
      oldDate.getMinutes(),
    );

    const correctedTimestampEvent: DateTimePickerEvent = {
      nativeEvent: {
        timestamp: newDate.getTime(),
        ...event.nativeEvent,
      },
      ...event,
    };

    setSelectedDate(newDate.getTime());
    onChange && onChange(correctedTimestampEvent);
  };

  const onTimeChange = (event: DateTimePickerEvent) => {
    const timestamp = event.nativeEvent.timestamp;
    const pickerDate = new Date(timestamp);

    const oldDate = new Date(selectedDate);
    const newDate = new Date(
      oldDate.getFullYear(),
      oldDate.getMonth(),
      oldDate.getDay(),
      pickerDate.getHours(),
      pickerDate.getMinutes(),
    );

    const correctedTimestampEvent: DateTimePickerEvent = {
      nativeEvent: {
        timestamp: newDate.getTime(),
        ...event.nativeEvent,
      },
      ...event,
    };

    setSelectedDate(newDate.getTime());
    onChange && onChange(correctedTimestampEvent);
  };

  return (
    <View style={{flexDirection: 'row', ...(style as object)}}>
      <RNDatePickerNative
        date={selectedDate}
        ref={ref as any}
        style={{flex: 1}}
        onChange={onDateChange}
        {...nativeProps}
      />
      <RNTimePickerNative
        date={selectedDate}
        ref={ref as any}
        style={{flex: 1}}
        onChange={onTimeChange}
        {...nativeProps}
      />
    </View>
  );
});
DateTimePickerIOS.displayName = 'DateTimePickerIOS';

const DatePickerIOS = forwardRef(
  (props: Props, ref: React.Ref<NativeMethods>) => {
    const {
      date,
      initialDate,
      onChange,
      onDateChange,
      minimumDate,
      maximumDate,
      locale,
      mode,
      style,
      ...other
    } = props;

    const _date: Date = nullthrows(
      date || initialDate,
      'A selected date or initial date should be specified.',
    );

    const _onChange = (event: DateTimePickerEvent) => {
      const timestamp = event.nativeEvent.timestamp;
      const pickerDate = new Date(timestamp);

      onDateChange && onDateChange(pickerDate);
      onChange &&
        onChange({
          timestamp: timestamp,
        });
    };

    const nativeProps = {
      date: dateToMilliseconds(_date),
      maximumDate: dateToMilliseconds(maximumDate),
      minimumDate: dateToMilliseconds(minimumDate),
      locale: locale !== null && locale !== '' ? locale : undefined,
      onChange: _onChange,
      style: {width: '100%', height: '100%'} as object,
      ref: ref as any,
      ...other,
    };

    const picker = (() => {
      switch (mode) {
        case 'time':
          return <RNTimePickerNative {...nativeProps} />;
        case 'datetime':
          return <DateTimePickerIOS {...nativeProps} />;
        case 'date':
        default:
          return <RNDatePickerNative {...nativeProps} />;
      }
    })();

    // We use the outer wrapping view for general view props and the inner one
    // to enforce a default height for the date picker, same as the RN implementation:
    // https://github.com/facebook/react-native/blob/v0.61.5/Libraries/Components/DatePicker/DatePickerIOS.ios.js#L187
    return (
      <View style={style}>
        <View style={{height: 216, width: '100%'}}>{picker}</View>
      </View>
    );
  },
);
DatePickerIOS.displayName = 'DatePickerIOS';

export default DatePickerIOS;
