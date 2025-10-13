/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const restoreRemoveListener = require('./compat/restoreRemoveListener');
const { ensurePropTypes: withPropTypes } = require('./compat/ensurePropTypes');
const warnOnce = require('@react-native-oh/react-native-harmony/Libraries/Utilities/warnOnce');

module.exports = {
  get AccessibilityInfo() {
    const mod =
      require('./Libraries/Components/AccessibilityInfo/AccessibilityInfo').default;
    restoreRemoveListener(mod, 'addEventListener', 'removeEventListener');
    return mod;
  },
  get ActionSheetIOS() {
    return require('@react-native-oh/react-native-harmony/Libraries/ActionSheetIOS/ActionSheetIOS');
  },
  get ActivityIndicator() {
    return require('@react-native-oh/react-native-harmony/Libraries/Components/ActivityIndicator/ActivityIndicator')
      .default;
  },
  get ART() {
    warnOnce(
      'art-not-supported',
      "react-native-harmony-61-interop doesn't support ART"
    );
    return require('./Libraries/ART/ReactNativeART');
  },
  get Alert() {
    return require('@react-native-oh/react-native-harmony/Libraries/Alert/Alert');
  },
  get Animated() {
    return require('./Libraries/Animated/Animated').default;
  },
  get Appearance() {
    return require('@react-native-oh/react-native-harmony/Libraries/Utilities/Appearance');
  },
  get AppRegistry() {
    return require('@react-native-oh/react-native-harmony/Libraries/ReactNative/AppRegistry');
  },
  get AppState() {
    const mod = require('@react-native-oh/react-native-harmony/Libraries/AppState/AppState');
    restoreRemoveListener(mod, 'addEventListener', 'removeEventListener');
    return mod;
  },
  get BackHandler() {
    const mod =
      require('@react-native-oh/react-native-harmony/Libraries/Utilities/BackHandler').default;
    restoreRemoveListener(mod, 'addEventListener', 'removeEventListener');
    return mod;
  },
  get Button() {
    return require('@react-native-oh/react-native-harmony/Libraries/Components/Button')
      .default;
  },
  get DevSettings() {
    return require('@react-native-oh/react-native-harmony/Libraries/Utilities/DevSettings');
  },
  get Dimensions() {
    const mod =
      require('@react-native-oh/react-native-harmony/Libraries/Utilities/Dimensions').default;
    restoreRemoveListener(mod, 'addEventListener', 'removeEventListener');
    return mod;
  },
  get DeviceEventEmitter() {
    return require('@react-native-oh/react-native-harmony/Libraries/EventEmitter/RCTDeviceEventEmitter')
      .default;
  },
  get DeviceInfo() {
    return require('@react-native-oh/react-native-harmony/Libraries/Utilities/DeviceInfo');
  },
  get DrawerLayoutAndroid() {
    return require('@react-native-oh/react-native-harmony/Libraries/Components/DrawerAndroid/DrawerLayoutAndroid');
  },
  get Easing() {
    return require('@react-native-oh/react-native-harmony/Libraries/Animated/Easing')
      .default;
  },
  get findNodeHandle() {
    return require('@react-native-oh/react-native-harmony/Libraries/ReactNative/RendererProxy')
      .findNodeHandle;
  },
  get FlatList() {
    return require('@react-native-oh/react-native-harmony/Libraries/Lists/FlatList');
  },
  get Image() {
    return withPropTypes(
      require('@react-native-oh/react-native-harmony/Libraries/Image/Image')
        .default
    );
  },
  get ImageBackground() {
    return require('@react-native-oh/react-native-harmony/Libraries/Image/ImageBackground');
  },
  get InputAccessoryView() {
    return require('@react-native-oh/react-native-harmony/Libraries/Components/TextInput/InputAccessoryView')
      .default;
  },
  get I18nManager() {
    return require('@react-native-oh/react-native-harmony/Libraries/ReactNative/I18nManager');
  },
  get LayoutAnimation() {
    return require('@react-native-oh/react-native-harmony/Libraries/LayoutAnimation/LayoutAnimation');
  },
  get Linking() {
    const mod = require('@react-native-oh/react-native-harmony/Libraries/Linking/Linking');
    restoreRemoveListener(mod, 'addEventListener', 'removeEventListener');
    return mod;
  },
  get LogBox() {
    return require('@react-native-oh/react-native-harmony/Libraries/LogBox/LogBox')
      .default;
  },
  get Modal() {
    return require('@react-native-oh/react-native-harmony/Libraries/Modal/Modal');
  },
  get Keyboard() {
    const mod = require('@react-native-oh/react-native-harmony/Libraries/Components/Keyboard/Keyboard');
    restoreRemoveListener(mod, 'addListener', 'removeListener');
    return mod;
  },
  get KeyboardAvoidingView() {
    return require('@react-native-oh/react-native-harmony/Libraries/Components/Keyboard/KeyboardAvoidingView')
      .default;
  },
  get NativeEventEmitter() {
    return require('./Libraries/EventEmitter/NativeEventEmitter');
  },
  get NativeModules() {
    return require('@react-native-oh/react-native-harmony/Libraries/BatchedBridge/NativeModules');
  },
  get Picker() {
    return require('./Libraries/Components/Picker/Picker').default;
  },
  get PixelRatio() {
    return require('@react-native-oh/react-native-harmony/Libraries/Utilities/PixelRatio')
      .default;
  },
  get Platform() {
    return require('@react-native-oh/react-native-harmony/Libraries/Utilities/Platform');
  },
  get PlatformColor() {
    return require('@react-native-oh/react-native-harmony/Libraries/StyleSheet/PlatformColorValueTypes')
      .PlatformColor;
  },
  get Pressable() {
    return require('@react-native-oh/react-native-harmony/Libraries/Components/Pressable/Pressable')
      .default;
  },
  get RefreshControl() {
    return require('./Libraries/Components/RefreshControl/RefreshControl')
      .default;
  },
  get requireNativeComponent() {
    return require('@react-native-oh/react-native-harmony/Libraries/ReactNative/requireNativeComponent')
      .default;
  },
  get RootTagContext() {
    return require('@react-native-oh/react-native-harmony/Libraries/ReactNative/RootTag')
      .RootTagContext;
  },
  get ProgressBarAndroid() {
    // Placeholder
    return require('@react-native-oh/react-native-harmony/Libraries/Components/View/View');
  },
  get ProgressViewIOS() {
    // Placeholder
    return require('@react-native-oh/react-native-harmony/Libraries/Components/View/View');
  },
  get SafeAreaView() {
    return require('@react-native-oh/react-native-harmony/Libraries/Components/SafeAreaView/SafeAreaView')
      .default;
  },
  get SegmentedControlIOS() {
    return require('./Libraries/Components/SegmentedControlIOS/SegmentedControlIOS');
  },
  get Settings() {
    return require('@react-native-oh/react-native-harmony/Libraries/Settings/Settings')
      .default;
  },
  get Share() {
    return require('@react-native-oh/react-native-harmony/Libraries/Share/Share');
  },
  get ScrollView() {
    return require('./Libraries/Components/ScrollView/ScrollView').default;
  },
  get StatusBar() {
    return require('@react-native-oh/react-native-harmony/Libraries/Components/StatusBar/StatusBar');
  },
  get StyleSheet() {
    return require('@react-native-oh/react-native-harmony/Libraries/StyleSheet/StyleSheet');
  },
  get Switch() {
    return require('@react-native-oh/react-native-harmony/Libraries/Components/Switch/Switch')
      .default;
  },
  get Systrace() {
    return require('@react-native-oh/react-native-harmony/Libraries/Performance/Systrace');
  },
  get Text() {
    return withPropTypes(
      require('@react-native-oh/react-native-harmony/Libraries/Text/Text')
    );
  },
  get TextInput() {
    return withPropTypes(
      require('@react-native-oh/react-native-harmony/Libraries/Components/TextInput/TextInput')
    );
  },
  get ToastAndroid() {
    return require('@react-native-oh/react-native-harmony/Libraries/Components/ToastAndroid/ToastAndroid.android');
  },
  get Touchable() {
    return require('@react-native-oh/react-native-harmony/Libraries/Components/Touchable/Touchable')
      .default;
  },
  get TouchableHighlight() {
    return withPropTypes(
      require('@react-native-oh/react-native-harmony/Libraries/Components/Touchable/TouchableHighlight')
    );
  },
  get TouchableNativeFeedback() {
    return withPropTypes(
      require('@react-native-oh/react-native-harmony/Libraries/Components/Touchable/TouchableNativeFeedback')
    );
  },
  get TouchableOpacity() {
    return withPropTypes(
      require('./Libraries/Components/Touchable/TouchableOpacity')
    );
  },
  get TouchableWithoutFeedback() {
    return withPropTypes(
      require('@react-native-oh/react-native-harmony/Libraries/Components/Touchable/TouchableWithoutFeedback')
    );
  },
  get TurboModuleRegistry() {
    return require('@react-native-oh/react-native-harmony/Libraries/TurboModule/TurboModuleRegistry');
  },
  get TVEventHandler() {
    return require('./Libraries/Components/AppleTV/TVEventHandler');
  },
  get UIManager() {
    return require('@react-native-oh/react-native-harmony/Libraries/ReactNative/UIManager');
  },
  get unstable_batchedUpdates() {
    return require('@react-native-oh/react-native-harmony/Libraries/ReactNative/RendererProxy')
      .unstable_batchedUpdates;
  },
  get useAnimatedValue() {
    return require('@react-native-oh/react-native-harmony/Libraries/Animated/useAnimatedValue')
      .default;
  },
  get useColorScheme() {
    return require('@react-native-oh/react-native-harmony/Libraries/Utilities/useColorScheme')
      .default;
  },
  get useWindowDimensions() {
    return require('@react-native-oh/react-native-harmony/Libraries/Utilities/useWindowDimensions')
      .default;
  },
  get View() {
    return require('@react-native-oh/react-native-harmony/Libraries/Components/View/View');
  },
  get InteractionManager() {
    return require('@react-native-oh/react-native-harmony/Libraries/Interaction/InteractionManager');
  },
  get PanResponder() {
    return require('@react-native-oh/react-native-harmony/Libraries/Interaction/PanResponder')
      .default;
  },
  get processColor() {
    return require('@react-native-oh/react-native-harmony/Libraries/StyleSheet/processColor')
      .default;
  },
  get SectionList() {
    return require('@react-native-oh/react-native-harmony/Libraries/Lists/SectionList')
      .default;
  },
  get Vibration() {
    return require('@react-native-oh/react-native-harmony/Libraries/Vibration/Vibration');
  },
  get VirtualizedList() {
    return require('@react-native-oh/react-native-harmony/Libraries/Lists/VirtualizedList');
  },
  // BEGIN: react-native-harmony specific exports
  get registerViewConfig() {
    return require('@react-native-oh/react-native-harmony/Libraries/Renderer/shims/ReactNativeViewConfigRegistry')
      .register;
  },
  get ReactNativeViewAttributes() {
    return require('@react-native-oh/react-native-harmony/Libraries/Components/View/ReactNativeViewAttributes');
  },
  get dispatchCommand() {
    return require('@react-native-oh/react-native-harmony/Libraries/Renderer/shims/ReactNative')
      .default.dispatchCommand;
  },
  // END: react-native-harmony specific exports
  // BEGIN: 61 specific exports
  get CheckBox() {
    return require('./Libraries/Components/CheckBox/CheckBox').default;
  },
  get MaskedViewIOS() {
    return require('./Libraries/Components/MaskedView/MaskedView').default;
  },
  // Top-level legacy RN61 PropTypes exports
  get ColorPropType() {
    return require('./Libraries/DeprecatedPropTypes/DeprecatedColorPropType');
  },
  get EdgeInsetsPropType() {
    return require('./Libraries/DeprecatedPropTypes/DeprecatedEdgeInsetsPropType');
  },
  get PointPropType() {
    return require('./Libraries/DeprecatedPropTypes/DeprecatedPointPropType');
  },
  get ViewPropTypes() {
    return require('./Libraries/DeprecatedPropTypes/DeprecatedViewPropTypes');
  },
  // END: 61 specific exports
};
