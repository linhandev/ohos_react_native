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

import type {RNTesterExample} from '../types/RNTesterTypes';

const ComponentExamples: Array<RNTesterExample> = [
  {
    key: 'ActivityIndicatorExample',
    module: require('../examples/ActivityIndicator/ActivityIndicatorExample'),
  },
  {
    key: 'ARTExample',
    module: require('../examples/ART/ARTExample'),
  },
  {
    key: 'ButtonExample',
    module: require('../examples/Button/ButtonExample'),
  },
  {
    key: 'CheckBoxExample',
    module: require('../examples/CheckBox/CheckBoxExample'),
  },
  {
    key: 'DatePickerIOSExample',
    module: require('../examples/DatePicker/DatePickerIOSExample'),
  },
  {
    key: 'FlatListExample',
    module: require('../examples/FlatList/FlatListExample'),
  },
  {
    key: 'ImageExample',
    module: require('../examples/Image/ImageExample'),
  },
  {
    key: 'JSResponderHandlerExample',
    module: require('../examples/JSResponderHandlerExample/JSResponderHandlerExample'),
  },
  {
    key: 'InputAccessoryViewExample',
    module: require('../examples/InputAccessoryView/InputAccessoryViewExample'),
  },
  {
    key: 'KeyboardAvoidingViewExample',
    module: require('../examples/KeyboardAvoidingView/KeyboardAvoidingViewExample'),
  },
  {
    key: 'MaskedViewExample',
    module: require('../examples/MaskedView/MaskedViewExample'),
  },
  // {
  //   key: 'ModalExample',
  //   module: require('../examples/Modal/ModalExample'),
  // },
  {
    key: 'MultiColumnExample',
    module: require('../examples/MultiColumn/MultiColumnExample'),
  },
  {
    key: 'NewAppScreenExample',
    module: require('../examples/NewAppScreen/NewAppScreenExample'),
  },
  {
    key: 'PickerExample',
    module: require('../examples/Picker/PickerExample'),
  },
  // {
  //   key: 'PickerIOSExample',
  //   module: require('../examples/Picker/PickerIOSExample'),
  // },
  {
    key: 'ProgressViewIOSExample',
    module: require('../examples/ProgressViewIOS/ProgressViewIOSExample'),
  },
  {
    key: 'PickerIOSExample',
    module: require('../examples/Picker/PickerIOSExample'),
  },
  {
    key: 'ProgressBarAndroidExample',
    module: require('../examples/ProgressBarAndroid/ProgressBarAndroidExample'),
  },
  {
    key: 'RefreshControlExample',
    module: require('../examples/RefreshControl/RefreshControlExample'),
  },
  {
    key: 'SafeAreaViewExample',
    module: require('../examples/SafeAreaView/SafeAreaViewExample'),
  },
  {
    key: 'ScrollViewExample',
    module: require('../examples/ScrollView/ScrollViewExample'),
  },
  {
    key: 'ScrollViewSimpleExample',
    module: require('../examples/ScrollView/ScrollViewSimpleExample'),
  },
  {
    key: 'ScrollViewAnimatedExample',
    module: require('../examples/ScrollView/ScrollViewAnimatedExample'),
  },
  {
    key: '[RNOH] ScrollView:scrollWithoutAnimationToExample',
    module: require('../examples/ScrollView/ScrollViewScrollWithoutAnimationToExample'),
  },
  {
    key: 'SectionListExample',
    module: require('../examples/SectionList/SectionListExample'),
  },
  {
    key: 'SegmentedControlIOSExample',
    module: require('../examples/SegmentedControlIOS/SegmentedControlIOSExample'),
  },
  {
    key: 'SliderExample',
    module: require('../examples/Slider/SliderExample'),
  },
  {
    key: 'StatusBarExample',
    module: require('../examples/StatusBar/StatusBarExample'),
  },
  {
    key: 'SwitchExample',
    module: require('../examples/Switch/SwitchExample'),
  },
  {
    key: 'TextExample',
    module: require('../examples/Text/TextExample.android'),
  },
  {
    key: 'TextInputExample',
    module: require('../examples/TextInput/TextInputExample'),
  },
  {
    key: 'TouchableExample',
    module: require('../examples/Touchable/TouchableExample'),
  },
  {
    key: 'TransparentHitTestExample',
    module: require('../examples/TransparentHitTest/TransparentHitTestExample'),
  },
  {
    key: 'ViewExample',
    module: require('../examples/View/ViewExample'),
  },
  {
    key: '[RNOH] RefreshControlSizeExample',
    module: require('../examples/RefreshControl/RefreshControlSizeExample'),
  },
];

const APIExamples: Array<RNTesterExample> = [
  {
    key: 'AccessibilityExample',
    module: require('../examples/Accessibility/AccessibilityExample'),
  },
  {
    key: 'AccessibilityAndroidExample',
    module: require('../examples/Accessibility/AccessibilityAndroidExample'),
  },
  {
    key: 'AccessibilityIOSExample',
    module: require('../examples/Accessibility/AccessibilityIOSExample'),
  },
  {
    key: 'ActionSheetIOSExample',
    module: require('../examples/ActionSheetIOS/ActionSheetIOSExample'),
  },
  {
    key: 'AlertExample',
    module: require('../examples/Alert/AlertExample'),
  },
  {
    key: 'AlertIOSExample',
    module: require('../examples/Alert/AlertIOSExample'),
    supportsTVOS: true,
  },
  {
    key: 'AnimatedExample',
    module: require('../examples/Animated/AnimatedExample'),
  },
  {
    key: 'AnExApp',
    module: require('../examples/Animated/AnimatedGratuitousApp/AnExApp'),
  },
  {
    key: 'AppStateExample',
    module: require('../examples/AppState/AppStateExample'),
  },
  // {
  //   key: 'AsyncStorageExample',
  //   module: require('../examples/AsyncStorage/AsyncStorageExample'),
  // },
  {
    key: 'BorderExample',
    module: require('../examples/Border/BorderExample'),
  },
  {
    key: 'ClipboardExample',
    module: require('../examples/Clipboard/ClipboardExample'),
  },
  {
    key: 'CrashExample',
    module: require('../examples/Crash/CrashExample'),
  },
  {
    key: 'DatePickerAndroidExample',
    module: require('../examples/DatePicker/DatePickerAndroidExample'),
  },
  {
    key: 'Dimensions',
    module: require('../examples/Dimensions/DimensionsExample'),
  },
  {
    key: 'LayoutEventsExample',
    module: require('../examples/Layout/LayoutEventsExample'),
  },
  {
    key: 'LinkingExample',
    module: require('../examples/Linking/LinkingExample'),
  },
  {
    key: 'LayoutAnimationExample',
    module: require('../examples/Layout/LayoutAnimationExample'),
  },
  {
    key: 'LayoutExample',
    module: require('../examples/Layout/LayoutExample'),
  },
  {
    key: 'NativeAnimationsExample',
    module: require('../examples/NativeAnimation/NativeAnimationsExample.harmony'),
  },
  {
    key: 'OrientationChangeExample',
    module: require('../examples/OrientationChange/OrientationChangeExample'),
  },
  {
    key: 'PanResponderExample',
    module: require('../examples/PanResponder/PanResponderExample'),
  },
  // {
  //   key: 'PermissionsExampleAndroid',
  //   module: require('../examples/PermissionsAndroid/PermissionsExample'),
  // },
  {
    key: 'PointerEventsExample',
    module: require('../examples/PointerEvents/PointerEventsExample'),
  },
  {
    key: 'PushNotificationIOSExample',
    module: require('../examples/PushNotificationIOS/PushNotificationIOSExample'),
  },
  {
    key: 'PromiseExample - RNOH 0.61 Interop',
    module: require('../examples/Promise/PromiseExample'),
  },
  {
    key: 'RCTRootViewIOSExample',
    module: require('../examples/RCTRootView/RCTRootViewIOSExample'),
  },
  {
    key: 'RTLExample',
    module: require('../examples/RTL/RTLExample'),
  },
  {
    key: 'ShareExample',
    module: require('../examples/Share/ShareExample'),
  },
  {
    key: 'SnapshotExample',
    module: require('../examples/Snapshot/SnapshotExample'),
  },
  {
    key: 'TimePickerAndroidExample',
    module: require('../examples/TimePicker/TimePickerAndroidExample'),
  },
  {
    key: 'TimerExample',
    module: require('../examples/Timer/TimerExample'),
  },
  {
    key: 'ToastAndroidExample',
    module: require('../examples/ToastAndroid/ToastAndroidExample'),
  },
  {
    key: 'TransformExample',
    module: require('../examples/Transform/TransformExample'),
  },
  {
    key: 'TurboModuleExample',
    module: require('../examples/TurboModule/TurboModuleExample'),
  },
  {
    key: 'TVEventHandlerExample',
    module: require('../examples/TVEventHandler/TVEventHandlerExample'),
  },
  {
    key: 'VibrationExample',
    module: require('../examples/Vibration/VibrationExample'),
  },
  {
    key: 'WebSocketExample',
    module: require('../examples/WebSocket/WebSocketExample'),
  },
  {
    key: 'XHRExample',
    module: require('../examples/XHR/XHRExample'),
  },
  {
    key: '[RNOH] LegacyListenersExample',
    module: require('../examples/Interop/LegacyListenersExample'),
  },
  {
    key: '[RNOH] AnimatedShimsWarningTest',
    module: require('../examples/Interop/AnimatedShimsWarningTest'),
  },
  {
    key: '[RNOH] PropTypesShimsTest',
    module: require('../examples/Interop/PropTypesShimsTest'),
  },
  {
    key: '[RNOH] TouchableOpacity interop test',
    module: require('../examples/Interop/TouchableOpacityInteropTest'),
  },
];

const Modules = {};

APIExamples.concat(ComponentExamples).forEach((Example) => {
  Modules[Example.key] = Example.module;
});

const RNTesterList = {
  APIExamples,
  ComponentExamples,
  Modules,
};

module.exports = RNTesterList;
