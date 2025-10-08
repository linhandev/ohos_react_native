if (global.window === undefined) {
  /**
   * Some RN framework uses RNOH 72 as a dependency and users of that framework don't install RNOH directly.
   * RN upstream code integration approach changed in RNOH 77, and RNOH must be installed directly.
   *
   * That RN framework SHOULD NOT use RNOH as a dependency (RNOH should be peerDependency). React Native expects
   * Out of Tree platforms to be directly installed in application projects. There's no guarantee that preserving
   * this behavior will be possible in future RN versions.
   *
   * If RN doesn't recognize RNOH as an OOT platform, serializer::getModulesRunBeforeMainModule won't be used.
   * Part of the RN OOT recognition logic depends on dependencies listed in application's package.json
   * (https://github.com/react-native-community/cli/blob/main/packages/cli-config/src/findDependencies.ts).
   */
  require('./Libraries/Core/InitializeCore');
}

module.exports = {
  get AccessibilityInfo() {
    return require('./Libraries/Components/AccessibilityInfo/AccessibilityInfo')
      .default;
  },
  get ActionSheetIOS() {
    return require('./Libraries/ActionSheetIOS/ActionSheetIOS');
  },
  get ActivityIndicator() {
    return require('./Libraries/Components/ActivityIndicator/ActivityIndicator')
      .default;
  },
  get Alert() {
    return require('./Libraries/Alert/Alert');
  },
  get Animated() {
    return require('./Libraries/Animated/Animated').default;
  },
  get Appearance() {
    return require('./Libraries/Utilities/Appearance');
  },
  get AppRegistry() {
    return require('./Libraries/ReactNative/AppRegistry');
  },
  get AppState() {
    return require('./Libraries/AppState/AppState');
  },
  get BackHandler() {
    return require('./Libraries/Utilities/BackHandler').default;
  },
  get Button() {
    return require('./Libraries/Components/Button').default;
  },
  get DevSettings() {
    return require('./Libraries/Utilities/DevSettings');
  },
  get Dimensions() {
    return require('./Libraries/Utilities/Dimensions').default;
  },
  get DeviceEventEmitter() {
    return require('./Libraries/EventEmitter/RCTDeviceEventEmitter').default;
  },
  get DrawerLayoutAndroid() {
    return require('./Libraries/Components/DrawerAndroid/DrawerLayoutAndroid');
  },
  get Easing() {
    return require('./Libraries/Animated/Easing').default;
  },
  get findNodeHandle() {
    return require('./Libraries/ReactNative/RendererProxy').findNodeHandle;
  },
  get FlatList() {
    return require('./Libraries/Lists/FlatList');
  },
  get Image() {
    return require('./Libraries/Image/Image').default;
  },
  get ImageBackground() {
    return require('./Libraries/Image/ImageBackground');
  },
  get I18nManager() {
    return require('./Libraries/ReactNative/I18nManager');
  },
  get LayoutAnimation() {
    return require('./Libraries/LayoutAnimation/LayoutAnimation');
  },
  get Linking() {
    return require('./Libraries/Linking/Linking');
  },
  get LogBox() {
    return require('./Libraries/LogBox/LogBox').default;
  },
  get Modal() {
    return require('./Libraries/Modal/Modal');
  },
  get Keyboard() {
    return require('./Libraries/Components/Keyboard/Keyboard');
  },
  get KeyboardAvoidingView() {
    return require('./Libraries/Components/Keyboard/KeyboardAvoidingView')
      .default;
  },
  get NativeEventEmitter() {
    return require('./Libraries/EventEmitter/NativeEventEmitter').default;
  },
  get NativeModules() {
    return require('./Libraries/BatchedBridge/NativeModules');
  },
  get PixelRatio() {
    return require('./Libraries/Utilities/PixelRatio').default;
  },
  get Platform() {
    return require('./Libraries/Utilities/Platform');
  },
  get PlatformColor() {
    return require('./Libraries/StyleSheet/PlatformColorValueTypes')
      .PlatformColor;
  },
  get Pressable() {
    return require('./Libraries/Components/Pressable/Pressable').default;
  },
  get RefreshControl() {
    return require('./Libraries/Components/RefreshControl/RefreshControl');
  },
  get requireNativeComponent() {
    return require('./Libraries/ReactNative/requireNativeComponent').default;
  },
  get RootTagContext() {
    return require('./Libraries/ReactNative/RootTag').RootTagContext;
  },
  get SafeAreaView() {
    return require('./Libraries/Components/SafeAreaView/SafeAreaView').default;
  },
  get Settings() {
    return require('./Libraries/Settings/Settings').default;
  },
  get Share() {
    return require('./Libraries/Share/Share');
  },
  get ScrollView() {
    return require('./Libraries/Components/ScrollView/ScrollView');
  },
  get StatusBar() {
    return require('./Libraries/Components/StatusBar/StatusBar');
  },
  get StyleSheet() {
    return require('./Libraries/StyleSheet/StyleSheet');
  },
  get Switch() {
    return require('./Libraries/Components/Switch/Switch').default;
  },
  get Systrace() {
    return require('./Libraries/Performance/Systrace');
  },
  get Text() {
    return require('./Libraries/Text/Text');
  },
  get TextInput() {
    return require('./Libraries/Components/TextInput/TextInput');
  },
  get ToastAndroid() {
    return require('./Libraries/Components/ToastAndroid/ToastAndroid.android');
  },
  get Touchable() {
    return require('./Libraries/Components/Touchable/Touchable').default;
  },
  get TouchableHighlight() {
    return require('./Libraries/Components/Touchable/TouchableHighlight');
  },
  get TouchableNativeFeedback() {
    return require('./Libraries/Components/Touchable/TouchableNativeFeedback');
  },
  get TouchableOpacity() {
    return require('./Libraries/Components/Touchable/TouchableOpacity');
  },
  get TouchableWithoutFeedback() {
    return require('./Libraries/Components/Touchable/TouchableWithoutFeedback');
  },
  get TurboModuleRegistry() {
    return require('./Libraries/TurboModule/TurboModuleRegistry');
  },
  get UIManager() {
    return require('./Libraries/ReactNative/UIManager');
  },
  get unstable_batchedUpdates() {
    return require('./Libraries/ReactNative/RendererProxy')
      .unstable_batchedUpdates;
  },
  get useAnimatedValue() {
    return require('./Libraries/Animated/useAnimatedValue').default;
  },
  get useColorScheme() {
    return require('./Libraries/Utilities/useColorScheme').default;
  },
  get useWindowDimensions() {
    return require('./Libraries/Utilities/useWindowDimensions').default;
  },
  get View() {
    return require('./Libraries/Components/View/View');
  },
  get InteractionManager() {
    return require('./Libraries/Interaction/InteractionManager');
  },
  get PanResponder() {
    return require('./Libraries/Interaction/PanResponder').default;
  },
  get processColor() {
    return require('./Libraries/StyleSheet/processColor').default;
  },
  get SectionList() {
    return require('./Libraries/Lists/SectionList').default;
  },
  get Vibration() {
    return require('./Libraries/Vibration/Vibration');
  },
  get VirtualizedList() {
    return require('./Libraries/Lists/VirtualizedList');
  },
  // BEGIN: react-native-harmony specific exports
  get registerViewConfig() {
    return require('./Libraries/Renderer/shims/ReactNativeViewConfigRegistry')
      .register;
  },
  get ReactNativeViewAttributes() {
    return require('./Libraries/Components/View/ReactNativeViewAttributes');
  },
  get dispatchCommand() {
    return require('./Libraries/Renderer/shims/ReactNative').default
      .dispatchCommand;
  },
  // END: react-native-harmony specific exports
};
