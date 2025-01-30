module.exports = {
  get AccessibilityInfo() {
    return require('@react-native-oh/react-native-core/Libraries/Components/AccessibilityInfo/AccessibilityInfo')
      .default;
  },
  get ActivityIndicator() {
    return require('@react-native-oh/react-native-core/Libraries/Components/ActivityIndicator/ActivityIndicator')
      .default;
  },
  get Alert() {
    return require('@react-native-oh/react-native-core/Libraries/Alert/Alert');
  },
  get Animated() {
    return require('@react-native-oh/react-native-core/Libraries/Animated/Animated')
      .default;
  },
  get Appearance() {
    return require('@react-native-oh/react-native-core/Libraries/Utilities/Appearance');
  },
  get AppRegistry() {
    return require('@react-native-oh/react-native-core/Libraries/ReactNative/AppRegistry');
  },
  get AppState() {
    return require('@react-native-oh/react-native-core/Libraries/AppState/AppState');
  },
  get BackHandler() {
    return require('./Libraries/Utilities/BackHandler').default;
  },
  get Button() {
    return require('@react-native-oh/react-native-core/Libraries/Components/Button')
      .default;
  },
  get DevSettings() {
    return require('@react-native-oh/react-native-core/Libraries/Utilities/DevSettings');
  },
  get Dimensions() {
    return require('@react-native-oh/react-native-core/Libraries/Utilities/Dimensions')
      .default;
  },
  get DeviceEventEmitter() {
    return require('@react-native-oh/react-native-core/Libraries/EventEmitter/RCTDeviceEventEmitter')
      .default;
  },
  get DrawerLayoutAndroid() {
    return require('@react-native-oh/react-native-core/Libraries/Components/DrawerAndroid/DrawerLayoutAndroid');
  },
  get Easing() {
    return require('@react-native-oh/react-native-core/Libraries/Animated/Easing')
      .default;
  },
  get findNodeHandle() {
    return require('@react-native-oh/react-native-core/Libraries/ReactNative/RendererProxy')
      .findNodeHandle;
  },
  get FlatList() {
    return require('@react-native-oh/react-native-core/Libraries/Lists/FlatList');
  },
  get Image() {
    return require('@react-native-oh/react-native-core/Libraries/Image/Image');
  },
  get ImageBackground() {
    return require('@react-native-oh/react-native-core/Libraries/Image/ImageBackground');
  },
  get I18nManager() {
    return require('@react-native-oh/react-native-core/Libraries/ReactNative/I18nManager');
  },
  get LayoutAnimation() {
    return require('@react-native-oh/react-native-core/Libraries/LayoutAnimation/LayoutAnimation');
  },
  get Linking() {
    return require('@react-native-oh/react-native-core/Libraries/Linking/Linking');
  },
  get LogBox() {
    return require('@react-native-oh/react-native-core/Libraries/LogBox/LogBox')
      .default;
  },
  get Modal() {
    return require('@react-native-oh/react-native-core/Libraries/Modal/Modal');
  },
  get Keyboard() {
    return require('@react-native-oh/react-native-core/Libraries/Components/Keyboard/Keyboard');
  },
  get KeyboardAvoidingView() {
    return require('@react-native-oh/react-native-core/Libraries/Components/Keyboard/KeyboardAvoidingView')
      .default;
  },
  get NativeEventEmitter() {
    return require('@react-native-oh/react-native-core/Libraries/EventEmitter/NativeEventEmitter')
      .default;
  },
  get NativeModules() {
    return require('@react-native-oh/react-native-core/Libraries/BatchedBridge/NativeModules');
  },
  get PixelRatio() {
    return require('@react-native-oh/react-native-core/Libraries/Utilities/PixelRatio')
      .default;
  },
  get Platform() {
    return require('./Libraries/Utilities/Platform');
  },
  get PlatformColor() {
    return require('./Libraries/StyleSheet/PlatformColorValueTypes')
      .PlatformColor;
  },
  get Pressable() {
    return require('@react-native-oh/react-native-core/Libraries/Components/Pressable/Pressable')
      .default;
  },
  get RefreshControl() {
    return require('@react-native-oh/react-native-core/Libraries/Components/RefreshControl/RefreshControl');
  },
  get requireNativeComponent() {
    return require('@react-native-oh/react-native-core/Libraries/ReactNative/requireNativeComponent')
      .default;
  },
  get RootTagContext() {
    return require('@react-native-oh/react-native-core/Libraries/ReactNative/RootTag')
      .RootTagContext;
  },
  get SafeAreaView() {
    return require('./Libraries/Components/SafeAreaView/SafeAreaView').default;
  },
  get Settings() {
    return require('./Libraries/Settings/Settings').default;
  },
  get Share() {
    return require('@react-native-oh/react-native-core/Libraries/Share/Share');
  },
  get ScrollView() {
    return require('@react-native-oh/react-native-core/Libraries/Components/ScrollView/ScrollView');
  },
  get StatusBar() {
    return require('@react-native-oh/react-native-core/Libraries/Components/StatusBar/StatusBar');
  },
  get StyleSheet() {
    return require('@react-native-oh/react-native-core/Libraries/StyleSheet/StyleSheet');
  },
  get Switch() {
    return require('@react-native-oh/react-native-core/Libraries/Components/Switch/Switch')
      .default;
  },
  get Systrace() {
    return require('@react-native-oh/react-native-core/Libraries/Performance/Systrace');
  },
  get Text() {
    return require('@react-native-oh/react-native-core/Libraries/Text/Text');
  },
  get TextInput() {
    return require('@react-native-oh/react-native-core/Libraries/Components/TextInput/TextInput');
  },
  get ToastAndroid() {
    return require('@react-native-oh/react-native-core/Libraries/Components/ToastAndroid/ToastAndroid.android');
  },
  get Touchable() {
    return require('@react-native-oh/react-native-core/Libraries/Components/Touchable/Touchable');
  },
  get TouchableHighlight() {
    return require('@react-native-oh/react-native-core/Libraries/Components/Touchable/TouchableHighlight');
  },
  get TouchableNativeFeedback() {
    return require('@react-native-oh/react-native-core/Libraries/Components/Touchable/TouchableNativeFeedback');
  },
  get TouchableOpacity() {
    return require('@react-native-oh/react-native-core/Libraries/Components/Touchable/TouchableOpacity');
  },
  get TouchableWithoutFeedback() {
    return require('@react-native-oh/react-native-core/Libraries/Components/Touchable/TouchableWithoutFeedback');
  },
  get TurboModuleRegistry() {
    return require('@react-native-oh/react-native-core/Libraries/TurboModule/TurboModuleRegistry');
  },
  get UIManager() {
    return require('@react-native-oh/react-native-core/Libraries/ReactNative/UIManager');
  },
  get unstable_batchedUpdates() {
    return require('@react-native-oh/react-native-core/Libraries/ReactNative/RendererProxy')
      .unstable_batchedUpdates;
  },
  get useAnimatedValue() {
    return require('@react-native-oh/react-native-core/Libraries/Animated/useAnimatedValue')
      .default;
  },
  get useColorScheme() {
    return require('@react-native-oh/react-native-core/Libraries/Utilities/useColorScheme')
      .default;
  },
  get useWindowDimensions() {
    return require('@react-native-oh/react-native-core/Libraries/Utilities/useWindowDimensions')
      .default;
  },
  get View() {
    return require('@react-native-oh/react-native-core/Libraries/Components/View/View');
  },
  get InteractionManager() {
    return require('@react-native-oh/react-native-core/Libraries/Interaction/InteractionManager');
  },
  get PanResponder() {
    return require('@react-native-oh/react-native-core/Libraries/Interaction/PanResponder')
      .default;
  },
  get processColor() {
    return require('@react-native-oh/react-native-core/Libraries/StyleSheet/processColor')
      .default;
  },
  get SectionList() {
    return require('@react-native-oh/react-native-core/Libraries/Lists/SectionList')
      .default;
  },
  get Vibration() {
    return require('@react-native-oh/react-native-core/Libraries/Vibration/Vibration');
  },
  get VirtualizedList() {
    return require('@react-native-oh/react-native-core/Libraries/Lists/VirtualizedList');
  },
  // BEGIN: react-native-harmony specific exports
  get registerViewConfig() {
    return require('@react-native-oh/react-native-core/Libraries/Renderer/shims/ReactNativeViewConfigRegistry')
      .register;
  },
  get ReactNativeViewAttributes() {
    return require('@react-native-oh/react-native-core/Libraries/Components/View/ReactNativeViewAttributes');
  },
  get dispatchCommand() {
    return require('@react-native-oh/react-native-core/Libraries/Renderer/shims/ReactNative')
      .default.dispatchCommand;
  },
  // END: react-native-harmony specific exports
};
