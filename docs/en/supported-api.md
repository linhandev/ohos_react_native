## AccessibilityInfo
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|addEventListener() | |✅|✅|✅|
|announceForAccessibility() | |✅|✅|✅|
|announceForAccessibilityWithOptions() | |❌|✅|✅|
|getRecommendedTimeoutMillis() | |❌|✅|❌|
|isAccessibilityServiceEnabled() | |✅|✅|❌|
|isBoldTextEnabled() | |✅|❌|✅|
|isGrayscaleEnabled() | |❌|❌|✅|
|isInvertColorsEnabled() | |❌|❌|✅|
|isReduceMotionEnabled() | |❌|✅|✅|
|isReduceTransparencyEnabled() | |❌|❌|✅|
|isScreenReaderEnabled() | |✅|✅|✅|
|prefersCrossFadeTransitions() | |❌|❌|✅|
|setAccessibilityFocus() | |✅|✅|✅|
## Alert
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|alert() | |✅|✅|✅|
|prompt() | |❌|❌|✅|
## Animated
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|decay() | |✅|✅|✅|
|timing() | |✅|✅|✅|
|spring() | |✅|✅|✅|
|add() | |✅|✅|✅|
|subtract() | |✅|✅|✅|
|divide() | |✅|✅|✅|
|multiply() | |✅|✅|✅|
|modulo() | |✅|✅|✅|
|diffClamp() | |✅|✅|✅|
|delay() | |✅|✅|✅|
|sequence() | |✅|✅|✅|
|parallel() | |✅|✅|✅|
|stagger() | |✅|✅|✅|
|loop() | |✅|✅|✅|
|event() | |✅|✅|✅|
|forkEvent() | |✅|✅|✅|
|unforkEvent() | |✅|✅|✅|
|start() | |✅|✅|✅|
|stop() | |✅|✅|✅|
|reset() | |✅|✅|✅|
|Value | |✅|✅|✅|
|ValueXY | |✅|✅|✅|
|Interpolation | |✅|✅|✅|
|Node | |✅|✅|✅|
|createAnimatedComponent | |✅|✅|✅|
|WithAnimatedArray | |❌|❔|❔|
|AnimatedComponent | |❌|❔|❔|
|attachNativeEvent | |✅|✅|✅|
## Animated.Value
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|setValue() | |✅|✅|✅|
|setOffset() | |✅|✅|✅|
|flattenOffset() | |✅|✅|✅|
|extractOffset() | |✅|✅|✅|
|addListener() | |✅|✅|✅|
|removeListener() | |✅|✅|✅|
|removeAllListeners() | |✅|✅|✅|
|stopAnimation() | |✅|✅|✅|
|resetAnimation() | |✅|✅|✅|
|interpolate() | |✅|✅|✅|
|animate() | |✅|✅|✅|
## Animated.ValueXY
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|setValue() | |✅|✅|✅|
|setOffset() | |✅|✅|✅|
|flattenOffset() | |✅|✅|✅|
|extractOffset() | |✅|✅|✅|
|addListener() | |✅|✅|✅|
|removeListener() | |✅|✅|✅|
|removeAllListeners() | |✅|✅|✅|
|stopAnimation() | |✅|✅|✅|
|resetAnimation() | |✅|✅|✅|
|getLayout() | |✅|✅|✅|
|getTranslateTransform() | |✅|✅|✅|
## Appearance
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|getColorScheme() | |✅|✅|✅|
|setColorScheme() | |✅|✅|✅|
|addChangeListener() | |✅|✅|✅|
## AppRegistry
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|setSurfaceProps() | |✅|❔|❔|
|cancelHeadlessTask() | |❔|❔|❔|
|getAppKeys() | |✅|✅|✅|
|getRegistry() | |✅|✅|✅|
|getRunnable() | |✅|✅|✅|
|getSectionKeys() | |✅|✅|✅|
|getSections() | |✅|✅|✅|
|registerCancellableHeadlessTask() | |❌|✅|✅|
|registerComponent() | |✅|✅|✅|
|registerConfig() | |❔|✅|✅|
|registerHeadlessTask() | |✅|✅|✅|
|registerRunnable() | |✅|✅|✅|
|registerSection() | |✅|✅|✅|
|runApplication() | |✅|✅|✅|
|setComponentProviderInstrumentationHook() | |❔|✅|✅|
|setWrapperComponentProvider() | |✅|✅|✅|
|startHeadlessTask() | |❌|✅|✅|
|unmountApplicationComponentAtRootTag() | |✅|✅|✅|
## AppState
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|Events |change |✅|✅|✅|
| |memoryWarning |⚠️|✅|✅|
| |focus |✅|✅|❌|
| |blur |✅|✅|❌|
|addEventListener() | |✅|✅|✅|
|isAvailable | |❔|❔|❔|
|currentState | |✅|✅|✅|
## DevSettings
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|addMenuItem() | |❔|✅|✅|
|reload() | |✅|✅|✅|
## Dimensions
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|addEventListener() | |❔|✅|✅|
|get() | |✅|✅|✅|
## Easing
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|step0() | |✅|✅|✅|
|step1() | |✅|✅|✅|
|linear() | |✅|✅|✅|
|ease() | |✅|✅|✅|
|quad() | |✅|✅|✅|
|cubic() | |✅|✅|✅|
|poly() | |✅|✅|✅|
|sin() | |✅|✅|✅|
|circle() | |✅|✅|✅|
|exp() | |✅|✅|✅|
|elastic() | |✅|✅|✅|
|back() | |✅|✅|✅|
|bounce() | |✅|✅|✅|
|bezier() | |✅|✅|✅|
|in() | |✅|✅|✅|
|out() | |✅|✅|✅|
|inOut() | |✅|✅|✅|
## InteractionManager
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|runAfterInteractions() | |✅|✅|✅|
|createInteractionHandle() | |❔|✅|✅|
|clearInteractionHandle() | |❔|✅|✅|
|setDeadline() | |❌|✅|✅|
## Keyboard
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|addListener() |keyboardDisShow |✅|✅|✅|
| |keyboardDidHide |✅|✅|✅|
|dismiss() | |❔|✅|✅|
|scheduleLayoutAnimation | |❔|✅|✅|
|isVisible() | |✅|✅|✅|
|removeListener | |❔|❔|❔|
|removeSubscription | |❔|❔|❔|
|metrics() | |✅|✅|✅|
## LayoutAnimation
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|configureNext() | |✅|✅|✅|
|Presets | |✅|✅|✅|
|Properties | |✅|✅|✅|
|Types | |✅|✅|✅|
|create() | |✅|✅|✅|
|easeInEaseOut | |✅|✅|✅|
|linear | |✅|✅|✅|
|spring | |✅|✅|✅|
## Linking
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|addEventListener() | |✅|✅|✅|
|canOpenURL() | |⚠️|✅|✅|
|getInitialURL() | |❔|✅|✅|
|openSettings() | |✅|✅|✅|
|openURL() | |✅|✅|✅|
|sendIntent() | |❌|✅|❌|
## PanResponder
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|create() | |✅|✅|✅|
## PixelRatio
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|get() | |✅|✅|✅|
|getFontScale() | |✅|✅|✅|
|getPixelSizeForLayoutSize() | |✅|✅|✅|
|startDetecting() | |❔|❔|❔|
|roundToNearestPixel() | |✅|✅|✅|
## Platform
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|constants | |✅|✅|✅|
|isPad | |❌|❌|✅|
|isTV | |✅|✅|✅|
|isTesting | |✅|✅|✅|
|OS | |✅|✅|✅|
|Version | |✅|✅|✅|
|select() | |✅|✅|✅|
## PlatformColor
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|PlatformColor | |✅|✅|✅|
## RootTag
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|RootTag | |❔|✅|✅|
## Share
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|share() |content.message |✅|✅|✅|
| |content.url |✅|❌|✅|
| |content.title |✅|✅|❌|
| |options.dialogTitle |❌|✅|❌|
| |options.excludedActivityTypes |❌|❌|✅|
| |options.subject |❌|❌|✅|
| |options.tintColor |❌|❌|✅|
| |optinos.anchor |❌|❌|✅|
|sharedAction | |✅|✅|✅|
|dismissedAction | |✅|❌|✅|
## StyleSheet
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|compose() | |✅|✅|✅|
|create() | |✅|✅|✅|
|flatten() | |✅|✅|✅|
|setStyleAttributePreprocessor() | |❔|✅|✅|
|absoluteFill | |✅|✅|✅|
|absoluteFillObject | |✅|✅|✅|
|hairlineWidth | |✅|✅|✅|
## Systrace
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|setEnabled() | |❌|❔|❔|
|isEnabled() | |✅|✅|✅|
|beginEvent() | |✅|✅|✅|
|endEvent() | |✅|✅|✅|
|beginAsyncEvent() | |✅|✅|✅|
|endAsyncEvent() | |✅|✅|✅|
|counterEvent() | |✅|✅|✅|
## Transforms
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|matrix | |✅|✅|✅|
|perspective | |❌|✅|✅|
|rotate | |✅|✅|✅|
|rotateX | |✅|✅|✅|
|rotateY | |✅|✅|✅|
|rotateZ | |✅|✅|✅|
|scale | |✅|✅|✅|
|scaleX | |✅|✅|✅|
|scaleY | |✅|✅|✅|
|translateX | |✅|✅|✅|
|translateY | |✅|✅|✅|
|skewX | |❌|❌|✅|
|skewY | |❌|❌|✅|
## Vibration
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|cancel() | |✅|✅|✅|
|vibrate() | |✅|✅|✅|
## useColorScheme
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
| | |✅|✅|✅|
## useWindowDimensions
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|fontScale | |✅|✅|✅|
|height | |✅|✅|✅|
|scale | |✅|✅|✅|
|width | |✅|✅|✅|
## BackHandler
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|addEventListener() | |✅|✅|❌|
|exitApp() | |❌|✅|❌|
|removeEventListener() | |✅|✅|❌|
## PermissionsAndroid
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|check() | |❌|✅|❌|
|requestPermission() | |❌|✅|❌|
|checkPermission() | |❌|✅|❌|
|PERMISSIONS | |❌|✅|❌|
|RESULTS | |❌|✅|❌|
|request() | |❌|✅|❌|
|requestMultiple() | |❌|✅|❌|
## ToastAndroid
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|show() | |✅|✅|❌|
|showWithGravity() | |⚠️|⚠️|❌|
|showWithGravityAndOffset() | |⚠️|⚠️|❌|
|SHORT | |❌|✅|❌|
|LONG | |❌|✅|❌|
|TOP | |❌|✅|❌|
|BOTTOM | |❌|✅|❌|
|CENTER | |❌|✅|❌|
## ActionSheetIOS
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|showActionSheetWithOptions() | |❌|❌|✅|
|dismissActionSheet() | |❌|❌|✅|
|showShareActionSheetWithOptions() | |❌|❌|✅|
## DynamicColorIOS
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|DynamicColorIOS | |❌|❌|✅|
## Settings
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|clearWatch() | |❌|❌|✅|
|get() | |❌|❌|✅|
|set() | |❌|❌|✅|
|watchKeys() | |❌|❌|✅|
## ActivityIndicator
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|animating | |✅|✅|✅|
|color | |✅|✅|✅|
|hidesWhenStopped | |❌|❌|✅|
|size | |✅|✅|✅|
## Button
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|onPress | |✅|✅|✅|
|title | |✅|✅|✅|
|accessibilityLabel | |✅|✅|✅|
|accessibilityLanguageiOS | |❌|❌|✅|
|accessibilityActions | |⚠️|✅|✅|
|onAccessibilityAction | |✅|✅|✅|
|color | |✅|✅|✅|
|disabled | |✅|✅|✅|
|hasTVPreferredFocus | |❌|⚠️|⚠️|
|nextFocusDown | |❌|⚠️|❌|
|nextFocusForward | |❌|⚠️|❌|
|nextFocusLeft | |❌|⚠️|❌|
|nextFocusRight | |❌|⚠️|❌|
|nextFocusUp | |❌|⚠️|❌|
|testID | |✅|✅|✅|
|touchSoundDisabled | |❌|✅|❌|
## FlatList
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|renderItem | |✅|✅|✅|
|data | |✅|✅|✅|
|ItemSeparatorComponent | |✅|✅|✅|
|ListEmptyComponent | |✅|✅|✅|
|ListFooterComponent | |✅|✅|✅|
|ListFooterComponentStyle | |✅|✅|✅|
|ListHeaderComponent | |✅|✅|✅|
|ListHeaderComponentStyle | |✅|✅|✅|
|columnWrapperStyle | |✅|✅|✅|
|extraData | |✅|✅|✅|
|getItemLayout | |✅|✅|✅|
|horizontal | |✅|✅|✅|
|initialNumToRender | |✅|✅|✅|
|initialScrollIndex | |✅|✅|✅|
|inverted | |✅|✅|✅|
|keyExtractor | |✅|✅|✅|
|numColumns | |✅|✅|✅|
|onRefresh | |✅|✅|✅|
|onViewableItemsChanged | |✅|✅|✅|
|progressViewOffset | |✅|✅|✅|
|refreshing | |✅|✅|✅|
|removeClippedSubviews | |✅|✅|✅|
|viewabilityConfig | |✅|✅|✅|
|viewabilityConfigCallbackPairs | |✅|✅|✅|
|flashScrollIndicators() | |✅|✅|✅|
|getNativeScrollRef() | |✅|✅|✅|
|getScrollResponder() | |✅|✅|✅|
|getScrollableNode() | |✅|✅|✅|
|scrollToEnd() | |✅|✅|✅|
|scrollToIndex() | |✅|✅|✅|
|scrollToItem() | |✅|✅|✅|
|scrollToOffset() | |✅|✅|✅|
## Image
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|accessible | |❌|✅|✅|
|accessibilityLabel | |❌|✅|✅|
|alt | |❌|✅|✅|
|blurRadius | |✅|✅|✅|
|capInsets | |❌|❌|✅|
|crossOrigin | |❌|✅|✅|
|defaultSource | |✅|✅|✅|
|fadeDuration | |❌|✅|❌|
|height | |✅|✅|✅|
|loadingIndicatorSource | |❔|✅|✅|
|onError | |✅|✅|✅|
|onLayout | |✅|✅|✅|
|onLoad | |✅|✅|✅|
|onLoadEnd | |✅|✅|✅|
|onLoadStart | |✅|✅|✅|
|onPartialLoad | |❌|❌|✅|
|onProgress | |❌|✅|✅|
|progressiveRenderingEnabled | |❌|✅|❌|
|resizeMethod | |✅|✅|❌|
|referrerPolicy | |❌|✅|✅|
|resizeMode | |✅|✅|✅|
|source | |✅|✅|✅|
|src | |❔|✅|✅|
|srcSet | |❔|✅|✅|
|style | |✅|✅|✅|
|testID | |❔|✅|✅|
|tintColor | |✅|✅|✅|
|width | |✅|✅|✅|
|abortPrefetch() | |✅|✅|❌|
|getSize() | |✅|✅|✅|
|getSizeWithHeaders() | |✅|✅|✅|
|prefetch() | |✅|✅|✅|
|queryCache() | |❔|✅|✅|
|resolveAssetSource() | |✅|✅|✅|
## ImageBackground
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|imageStyle | |✅|✅|✅|
|imageRef | |✅|✅|✅|
|style | |✅|✅|✅|
## KeyboardAvoidingView
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|behavior | |✅|✅|✅|
|contentContainerStyle | |✅|✅|✅|
|enabled | |✅|✅|✅|
|keyboardVerticalOffset | |✅|✅|✅|
## Modal
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|animated | |❌|✅|✅|
|animationType | |⚠️|✅|✅|
|hardwareAccelerated | |❔|✅|❌|
|onDismiss | |❌|❌|✅|
|onOrientationChange | |✅|❌|✅|
|onRequestClose | |✅|✅|✅|
|onShow | |✅|✅|✅|
|presentationStyle | |❌|❌|✅|
|statusBarTranslucent | |❌|✅|❌|
|supportedOrientations | |❌|❌|✅|
|transparent | |✅|✅|✅|
|visible | |✅|✅|✅|
## Pressable
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|android_disableSound | |❌|✅|❌|
|android_ripple | |❌|✅|❌|
|children | |✅|✅|✅|
|unstable_pressDelay | |❔|✅|✅|
|delayLongPress | |✅|✅|✅|
|disabled | |✅|✅|✅|
|hitSlop | |✅|✅|✅|
|onHoverIn | |✅|✅|✅|
|onHoverOut | |✅|✅|✅|
|onLongPress | |✅|✅|✅|
|onPress | |✅|✅|✅|
|onPressIn | |✅|✅|✅|
|onPressOut | |✅|✅|✅|
|pressRetentionOffset | |✅|✅|✅|
|style | |✅|✅|✅|
|testOnly_pressed | |❔|✅|✅|
## RefreshControl
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|refreshing | |✅|✅|✅|
|colors | |✅|✅|❌|
|enabled | |✅|✅|❌|
|onRefresh | |✅|✅|✅|
|progressBackgroundColor | |✅|✅|❌|
|progressViewOffset | |✅|✅|✅|
|size | |✅|✅|❌|
|tintColor | |✅|❌|✅|
|title | |✅|❌|✅|
|titleColor | |✅|❌|✅|
## ScrollView
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|StickyHeaderComponent | |✅|✅|✅|
|alwaysBounceHorizontal | |✅|❌|✅|
|alwaysBounceVertical | |✅|❌|✅|
|automaticallyAdjustContentInsets | |❌|❌|✅|
|automaticallyAdjustKeyboardInsets | |❌|❌|✅|
|automaticallyAdjustsScrollIndicatorInsets | |❌|❌|✅|
|bounces | |✅|❌|✅|
|bouncesZoom | |❌|❌|✅|
|canCancelContentTouches | |❌|❌|✅|
|centerContent | |❌|❌|✅|
|contentContainerStyle | |✅|✅|✅|
|contentInset | |❌|❌|✅|
|contentInsetAdjustmentBehavior | |❌|❌|✅|
|contentOffset | |✅|✅|✅|
|decelerationRate | |✅|✅|✅|
|directionalLockEnabled | |❌|❌|✅|
|disableIntervalMomentum | |✅|✅|✅|
|disableScrollViewPanResponder | |❌|✅|✅|
|endFillColor | |❌|✅|❌|
|fadingEdgeLength | |❌|✅|❌|
|horizontal | |✅|✅|✅|
|indicatorStyle | |✅|❌|✅|
|invertStickyHeaders | |✅|✅|✅|
|keyboardDismissMode | |❌|✅|✅|
|keyboardShouldPersistTaps | |✅|⚠️|✅|
|maintainVisibleContentPosition | |❌|✅|✅|
|maximumZoomScale | |❌|❌|✅|
|minimumZoomScale | |❌|❌|✅|
|nestedScrollEnabled | |❌|✅|❌|
|onContentSizeChange | |✅|✅|✅|
|onMomentumScrollBegin | |✅|✅|✅|
|onMomentumScrollEnd | |✅|✅|✅|
|onScroll | |✅|✅|✅|
|onScrollBeginDrag | |✅|✅|✅|
|onScrollEndDrag | |✅|✅|✅|
|onScrollToTop | |❌|❌|✅|
|overScrollMode | |✅|✅|❌|
|pagingEnabled | |✅|✅|✅|
|persistentScrollbar | |✅|✅|❌|
|pinchGestureEnabled | |❌|❌|✅|
|refreshControl | |✅|✅|✅|
|removeClippedSubviews | |✅|✅|✅|
|scrollEnabled | |✅|✅|✅|
|scrollEventThrottle | |✅|❌|✅|
|scrollIndicatorInsets | |❌|❌|✅|
|scrollPerfTag | |❌|✅|❌|
|scrollToOverflowEnabled | |✅|❌|✅|
|scrollsToTop | |❌|❌|✅|
|showsHorizontalScrollIndicator | |✅|✅|✅|
|showsVerticalScrollIndicator | |✅|✅|✅|
|snapToAlignment | |✅|❌|✅|
|snapToEnd | |✅|✅|✅|
|snapToInterval | |✅|✅|✅|
|snapToOffsets | |✅|✅|✅|
|snapToStart | |✅|✅|✅|
|stickyHeaderHiddenOnScroll | |✅|✅|✅|
|stickyHeaderIndices | |✅|✅|✅|
|zoomScale | |❌|❌|✅|
|flashScrollIndicators() | |✅|✅|✅|
|scrollTo() | |✅|✅|✅|
|scrollToEnd() | |✅|✅|✅|
## SectionList
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|renderItem | |✅|✅|✅|
|sections | |✅|✅|✅|
|extraData | |✅|✅|✅|
|initialNumToRender | |✅|✅|✅|
|inverted | |✅|✅|✅|
|ItemSeparatorComponent | |✅|✅|✅|
|keyExtractor | |✅|✅|✅|
|ListEmptyComponent | |✅|✅|✅|
|ListFooterComponent | |✅|✅|✅|
|ListHeaderComponent | |✅|✅|✅|
|onRefresh | |✅|✅|✅|
|onViewableItemsChanged | |✅|✅|✅|
|refreshing | |✅|✅|✅|
|removeClippedSubviews | |✅|✅|✅|
|renderSectionFooter | |✅|✅|✅|
|renderSectionHeader | |✅|✅|✅|
|SectionSeparatorComponent | |✅|✅|✅|
|stickySectionHeadersEnabled | |✅|✅|✅|
|flashScrollIndicators() | |❌|❌|✅|
|recordInteraction() | |✅|✅|✅|
|scrollToLocation() | |✅|✅|✅|
## StatusBar
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|currentHeight | |✅|✅|❌|
|animated | |✅|✅|✅|
|backgroundColor | |✅|✅|❌|
|barStyle | |✅|✅|✅|
|hidden | |✅|✅|✅|
|networkActivityIndicatorVisible | |❌|❌|✅|
|showHideTransition | |❌|❌|✅|
|translucent | |⚠️|✅|❌|
|popStackEntry() | |✅|✅|✅|
|pushStackEntry() | |✅|✅|✅|
|replaceStackEntry() | |❔|✅|✅|
|setBackgroundColor() | |✅|✅|❌|
|setBarStyle() | |✅|✅|✅|
|setHidden() | |✅|✅|✅|
|setNetworkActivityIndicatorVisible() | |❌|❌|✅|
|setTranslucent() | |⚠️|✅|❌|
## Switch
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|disabled | |✅|✅|✅|
|ios_backgroundColor | |❌|❌|✅|
|onChange | |✅|✅|✅|
|onValueChange | |✅|✅|✅|
|thumbColor | |✅|✅|✅|
|trackColor | |✅|✅|✅|
|value | |✅|✅|✅|
## Text
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|accessibilityHint | |✅|✅|✅|
|accessibilityLanguageiOS | |❌|❌|✅|
|accessibilityLabel | |✅|✅|✅|
|accessibilityRole | |✅|✅|✅|
|accessibilityState | |⚠️|✅|✅|
|accessibilityActions | |❌|✅|✅|
|onAccessibilityAction | |⚠️|✅|✅|
|accessible | |✅|✅|✅|
|adjustsFontSizeToFit | |✅|✅|✅|
|allowFontScaling | |⚠️|✅|✅|
|android_hyphenationFrequency | |❌|✅|❌|
|aria-busy | |❌|✅|✅|
|aria-checked | |❌|✅|✅|
|aria-disabled | |❌|✅|✅|
|aria-expanded | |❌|✅|✅|
|aria-label | |❌|✅|✅|
|aria-selected | |❌|✅|✅|
|dataDetectorType | |⚠️|✅|❌|
|disabled | |✅|✅|❌|
|dynamicTypeRamp | |❌|❌|✅|
|ellipsizeMode | |✅|✅|✅|
|id | |✅|✅|✅|
|maxFontSizeMultiplier | |❌|✅|✅|
|minimumFontScale | |✅|❌|✅|
|nativeID | |✅|✅|✅|
|numberOfLines | |✅|✅|✅|
|onLayout | |✅|✅|✅|
|onLongPress | |✅|✅|✅|
|onMoveShouldSetResponder | |❌|✅|✅|
|onPress | |✅|✅|✅|
|onPressIn | |✅|✅|✅|
|onPressOut | |✅|✅|✅|
|onResponderGrant | |✅|✅|✅|
|onResponderMove | |✅|✅|✅|
|onResponderRelease | |✅|✅|✅|
|onResponderTerminate | |✅|✅|✅|
|onResponderTerminationRequest | |✅|✅|✅|
|onStartShouldSetResponderCapture | |✅|✅|✅|
|onTextLayout | |✅|✅|✅|
|pressRetentionOffset | |❔|✅|✅|
|role | |❌|✅|✅|
|selectable | |✅|✅|✅|
|selectionColor | |✅|✅|❌|
|style |textShadowOffset |❌|✅|✅|
| |fontWeight |✅|✅|✅|
| |textDecorationLine |✅|✅|✅|
| |textDecorationColor |✅|✅|✅|
| |textShadowColor |❌|✅|✅|
| |textShadowRadius |❌|✅|✅|
| |fontFamily |✅|✅|✅|
| |fontVariant |✅|✅|✅|
| |includeFontPadding |❌|✅|❌|
| |textTransform |✅|✅|✅|
| |textDecorationStyle |✅|✅|✅|
| |writingDirection |✅|❌|✅|
| |...remainingStyles |✅|✅|✅|
|suppressHighlighting | |❔|❌|✅|
|testID | |✅|✅|✅|
|textBreakStrategy | |✅|✅|❌|
|userSelect | |✅|✅|✅|
|lineBreakStrategyIOS | |❌|❌|✅|
|children |nested texts |✅|✅|✅|
| |views inside text |✅|✅|✅|
## TextInput
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|allowFontScaling | |❌|✅|✅|
|autoCapitalize | |❌|✅|✅|
|autoComplete | |❌|✅|✅|
|autoCorrect | |❌|✅|✅|
|autoFocus | |✅|✅|✅|
|blurOnSubmit | |✅|✅|✅|
|caretHidden | |✅|✅|✅|
|clearButtonMode | |✅|❌|✅|
|clearTextOnFocus | |✅|❌|✅|
|contextMenuHidden | |✅|✅|✅|
|dataDetectorTypes | |✅|✅|❌|
|defaultValue | |✅|✅|✅|
|cursorColor | |✅|✅|❌|
|disableFullscreenUI | |❌|✅|❌|
|editable | |✅|✅|✅|
|enablesReturnKeyAutomatically | |❌|❌|✅|
|enterKeyHint | |✅|✅|✅|
|importantForAutofill | |❌|✅|❌|
|inlineImageLeft | |❌|✅|❌|
|inlineImagePadding | |❌|✅|❌|
|inputAccessoryViewID | |❌|❌|✅|
|inputMode | |✅|✅|✅|
|keyboardAppearance | |❌|❌|✅|
|keyboardType | |✅|✅|✅|
|maxFontSizeMultiplier | |❌|✅|✅|
|maxLength | |✅|✅|✅|
|multiline | |✅|✅|✅|
|numberOfLines | |❌|✅|❌|
|onBlur | |✅|✅|✅|
|onChange | |✅|✅|✅|
|onChangeText | |✅|✅|✅|
|onContentSizeChange | |✅|✅|✅|
|onEndEditing | |✅|✅|✅|
|onPressIn | |✅|✅|✅|
|onPressOut | |✅|✅|✅|
|onFocus | |✅|✅|✅|
|onKeyPress | |✅|✅|✅|
|onLayout | |✅|✅|✅|
|onScroll | |✅|✅|✅|
|onSelectionChange | |✅|✅|✅|
|onSubmitEditing | |✅|✅|✅|
|placeholder | |✅|✅|✅|
|placeholderTextColor | |✅|✅|✅|
|readOnly | |✅|✅|✅|
|returnKeyLabel | |✅|✅|❌|
|returnKeyType | |✅|✅|✅|
|rejectResponderTermination | |❌|❌|✅|
|rows | |❌|✅|❌|
|scrollEnabled | |❌|❌|✅|
|secureTextEntry | |✅|✅|✅|
|selection | |✅|✅|✅|
|selectionColor | |✅|✅|✅|
|selectTextOnFocus | |✅|✅|✅|
|showSoftInputOnFocus | |✅|✅|✅|
|spellCheck | |❌|❌|✅|
|textAlign | |✅|✅|✅|
|textContentType | |✅|❌|✅|
|passwordRules | |✅|❌|✅|
|style | |✅|✅|✅|
|textBreakStrategy | |✅|✅|❌|
|underlineColorAndroid | |❌|✅|❌|
|value | |✅|✅|✅|
|lineBreakStrategyIOS | |❌|❌|✅|
|focus() | |✅|✅|✅|
|blur() | |✅|✅|✅|
|clear() | |✅|✅|✅|
|isFocused() | |✅|✅|✅|
## TouchableHighlight
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|activeOpacity | |✅|✅|✅|
|onHideUnderlay | |✅|✅|✅|
|onShowUnderlay | |✅|✅|✅|
|style | |✅|✅|✅|
|underlayColor | |✅|✅|✅|
|hasTVPreferredFocus | |❌|❌|✅|
|nextFocusDown | |❌|✅|❌|
|nextFocusForward | |❌|✅|❌|
|nextFocusLeft | |❌|✅|❌|
|nextFocusRight | |❌|✅|❌|
|nextFocusUp | |❌|✅|❌|
|testOnly_pressed | |❔|✅|✅|
## TouchableOpacity
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|style | |✅|✅|✅|
|setOpacityTo() | |❌|❌|❌|
|activeOpacity | |✅|✅|✅|
|tvParallaxPropertiesIOS | |❌|❌|✅|
|hasTVPreferredFocusiOS | |❌|❌|✅|
|nextFocusDown | |❌|✅|❌|
|nextFocusForward | |❌|✅|❌|
|nextFocusLeft | |❌|✅|❌|
|nextFocusRight | |❌|✅|❌|
|nextFocusUp | |❌|✅|❌|
## TouchableWithoutFeedback
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|accessibilityIgnoresInvertColors | |❌|✅|✅|
|accessible | |✅|✅|✅|
|accessibilityLabel | |✅|✅|✅|
|accessibilityLanguageiOS | |❌|❌|✅|
|accessibilityHint | |✅|✅|✅|
|accessibilityRole | |✅|✅|✅|
|accessibilityState | |⚠️|✅|✅|
|accessibilityActions | |⚠️|✅|✅|
|aria-busy | |❌|✅|✅|
|aria-checked | |❌|✅|✅|
|aria-disabled | |❌|✅|✅|
|aria-expanded | |❌|✅|✅|
|aria-hidden | |❌|✅|✅|
|aria-label | |❌|✅|✅|
|aria-liveAndroid | |❌|✅|❌|
|aria-modaliOS | |❌|❌|✅|
|aria-selected | |❌|✅|✅|
|onAccessibilityAction | |✅|✅|✅|
|accessibilityValue | |❌|✅|✅|
|aria-valuemax | |❌|✅|✅|
|aria-valuemin | |❌|✅|✅|
|aria-valuenow | |❌|✅|✅|
|aria-valuetext | |❌|✅|✅|
|delayLongPress | |✅|✅|✅|
|delayPressIn | |✅|✅|✅|
|delayPressOut | |✅|✅|✅|
|disabled | |✅|✅|✅|
|hitSlop | |✅|✅|✅|
|id | |✅|✅|✅|
|onBlur | |❌|✅|✅|
|onFocus | |❌|✅|✅|
|onLayout | |✅|✅|✅|
|onLongPress | |✅|✅|✅|
|onPress | |✅|✅|✅|
|onPressIn | |✅|✅|✅|
|onPressOut | |✅|✅|✅|
|pressRetentionOffset | |❌|✅|✅|
|nativeID | |✅|✅|✅|
|testID | |✅|✅|✅|
|touchSoundDisabled | |❌|✅|✅|
## View
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|accessibilityActions | |⚠️|✅|✅|
|accessibilityElementsHiddeniOS | |❌|❌|✅|
|accessibilityHint | |✅|✅|✅|
|accessibilityLanguageiOS | |❌|❌|✅|
|accessibilityIgnoresInvertColorsiOS | |❌|❌|✅|
|accessibilityLabel | |✅|✅|✅|
|accessibilityLiveRegionAndroid | |❌|✅|❌|
|accessibilityRole | |✅|✅|✅|
|accessibilityState | |⚠️|✅|✅|
|accessibilityValue | |❌|✅|✅|
|accessibilityViewIsModaliOS | |❌|❌|✅|
|accessible | |✅|✅|✅|
|aria-busy | |❌|✅|✅|
|aria-checked | |❌|✅|✅|
|aria-disabled | |✅|✅|✅|
|aria-expanded | |❌|✅|✅|
|aria-hidden | |✅|✅|✅|
|aria-label | |⚠️|✅|✅|
|aria-labelledby | |⚠️|✅|❌|
|aria-live | |❌|✅|❌|
|aria-modal | |❌|❌|✅|
|aria-selected | |✅|✅|✅|
|aria-valuemax | |❌|✅|✅|
|aria-valuemin | |❌|✅|✅|
|aria-valuenow | |❌|✅|✅|
|aria-valuetext | |❌|✅|✅|
|collapsable | |❌|✅|❌|
|focusable | |⚠️|✅|❌|
|hitSlop | |✅|✅|✅|
|id | |✅|✅|✅|
|importantForAccessibility | |❔|✅|❌|
|nativeID | |✅|✅|✅|
|needsOffscreenAlphaCompositing | |✅|✅|✅|
|nextFocusDown | |❌|✅|❌|
|nextFocusForward | |❌|✅|❌|
|nextFocusLeft | |❌|✅|❌|
|nextFocusRight | |❌|✅|❌|
|nextFocusUp | |❌|✅|❌|
|onAccessibilityAction | |✅|✅|✅|
|onAccessibilityEscape | |❌|❌|✅|
|onAccessibilityTap | |❌|✅|✅|
|onLayout | |✅|✅|✅|
|onMagicTap | |❌|❌|✅|
|onMoveShouldSetResponder | |✅|✅|✅|
|onMoveShouldSetResponderCapture | |✅|✅|✅|
|onResponderGrant | |✅|✅|✅|
|onResponderMove | |✅|✅|✅|
|onResponderReject | |❔|✅|✅|
|onResponderRelease | |✅|✅|✅|
|onResponderTerminate | |✅|✅|✅|
|onResponderTerminationRequest | |✅|✅|✅|
|onStartShouldSetResponder | |❔|✅|✅|
|onStartShouldSetResponderCapture | |❔|✅|✅|
|pointerEvents | |✅|✅|✅|
|removeClippedSubviews | |✅|✅|✅|
|renderToHardwareTextureAndroid | |❌|✅|❌|
|role | |❌|✅|✅|
|shouldRasterizeIOS | |❌|❌|✅|
|style |borderTopStartRadius |✅|✅|✅|
| |borderTopEndRadius |✅|✅|✅|
| |borderBottomStartRadius |✅|✅|✅|
| |borderBottomEndRadius |✅|✅|✅|
| |borderStartColor |✅|✅|✅|
| |borderEndColor |✅|✅|✅|
| |borderStyle |✅|✅|✅|
| |borderCurve |❌|✅|✅|
| |elevation |❌|✅|❌|
| |opacity |✅|✅|✅|
| |shadowOffset |✅|❌|✅|
| |shadowOpacity |✅|❌|✅|
| |...remainingProps |✅|✅|✅|
|tabIndex | |❔|✅|❌|
|testID | |✅|✅|✅|
## VirtualizedList
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|ref |scrollToIndex() |✅|✅|✅|
| |scrollToEnd() |✅|✅|✅|
| |scrollToItem() |✅|✅|✅|
| |scrollToOffset() |✅|✅|✅|
| |recordInteraction() |✅|✅|✅|
| |getScrollResponder() |✅|✅|✅|
| |getScrollableNode() |✅|✅|✅|
| |getScrollaRef() |✅|✅|✅|
| |setNativeProps() |❔|✅|✅|
| |getChildContext() |❌|❌|❌|
| |hasMore() |❔|✅|✅|
|data | |✅|✅|✅|
|getItem | |✅|✅|✅|
|getItemCount | |✅|✅|✅|
|renderItem | |✅|✅|✅|
|CellRendererComponent | |✅|✅|✅|
|ItemSeparatorComponent | |✅|✅|✅|
|ListEmptyComponent | |✅|✅|✅|
|ListItemComponent | |✅|✅|✅|
|ListFooterComponent | |✅|✅|✅|
|ListFooterComponentStyle | |✅|✅|✅|
|ListHeaderComponent | |✅|✅|✅|
|ListHeaderComponentStyle | |✅|✅|✅|
|debug | |❔|✅|✅|
|disableVirtualization | |✅|✅|✅|
|extraData | |✅|✅|✅|
|getItemLayout | |✅|✅|✅|
|horizontal | |✅|✅|✅|
|initialNumToRender | |✅|✅|✅|
|initialScrollIndex | |✅|✅|✅|
|inverted | |✅|✅|✅|
|listKey | |❔|✅|✅|
|keyExtractor | |✅|✅|✅|
|maxToRenderPerBatch | |✅|✅|✅|
|onEndReached | |✅|✅|✅|
|onEndReachedThreshold | |✅|✅|✅|
|onRefresh | |✅|✅|✅|
|onScrollToIndexFailed | |✅|✅|✅|
|onStartReached | |✅|✅|✅|
|onStartReachedThreshold | |✅|✅|✅|
|onViewableItemsChanged | |✅|✅|✅|
|persistentScrollbar | |✅|✅|✅|
|progressViewOffset | |✅|✅|✅|
|refreshControl | |✅|✅|✅|
|refreshing | |✅|✅|✅|
|removeClippedSubviews | |✅|✅|✅|
|renderScrollComponent | |❔|✅|✅|
|viewabilityConfig | |✅|✅|✅|
|viewabilityConfigCallbackPairs | |✅|✅|✅|
|updateCellsBatchingPeriod | |⚠️|✅|✅|
|windowSize | |✅|✅|✅|
## Android Specific Components
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|DrawerLayoutAndroid | |❌|✅|❌|
|TouchableNativeFeedback | |❌|✅|❌|
## InputAccessoryView
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
|backgroundColor | |❌|❌|✅|
|nativeID | |❌|❌|✅|
|style | |❌|❌|✅|
## SafeAreaView
| Function | |Supported on OpenHarmony|Supported on Android|Supported on iOS|
|---|---|:---:|:---:|:---:|
| SafeAreaView | |✅|❌|✅|
