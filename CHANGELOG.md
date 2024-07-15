# Changelog

## v0.72.32
- deprecated `TurboModule` and `TurboModuleContext` in favor of `UITurboModule` and `UITurboModuleContext` or `WorkerTurboModule` and `WorkerTurboModuleContext` ([baa2da0850](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/baa2da085017ad461e322ac2cf6ad668aaaabe59))
- deprecated `TurboModulesFactory` in favor of `UITurboModuleFactory` and `WorkerTurboModuleFactory` ([baa2da0850](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/baa2da085017ad461e322ac2cf6ad668aaaabe59))
- added `TextInput::passwordRules` experimental support ([6d4effb93c](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6d4effb93c2a0d0b880d662b4adc984672fbb00d))
- added `WorkerTurboModule` ([baa2da0850](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/baa2da085017ad461e322ac2cf6ad668aaaabe59))
- added `RNPackage::createWorkerTurboModuleFactory` — this method is expected to be overridden by library developers if a library provides Turbo Modules that can run on the WorkerThread ([baa2da0850](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/baa2da085017ad461e322ac2cf6ad668aaaabe59))
- added `setupRNOHWorker` — this function is expected to be used by app developers and it is expected to be called in the worker script ([baa2da0850](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/baa2da085017ad461e322ac2cf6ad668aaaabe59))
- added `RNAbility::getRNOHWorkerScriptUrl` (and `RNInstancesCoordinatorDependencies::rnohWorkerScriptUrl`) — app developers are expected to override `getRNOHWorkerScriptUrl` to enable worker thread and WorkerTurboModules. Currently, WorkerThread is opt-in feature. ([baa2da0850](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/baa2da085017ad461e322ac2cf6ad668aaaabe59))
- fixed a crash which could happen when a touch was cancelled while another is active ([b5bf4d383f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b5bf4d383f9d9745ee58b50f1b5fe67eb1eeac9f))
- fixed animated events not updating views when no other animations are running ([16b7c2f0b2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/16b7c2f0b2c8804606cddf02278afd66966d5199))
- fixes native responder blocking not taking place ([cf1c104b4b](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/cf1c104b4b20a4cb24c2bab85646f5683fdcabb5))
- removed throttling from StandardRNOHLogger ([baa2da0850](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/baa2da085017ad461e322ac2cf6ad668aaaabe59))
- optimized ComponentInstance allocation ([183106af39](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/183106af399adc69372a9cef8970dd149e2fa25d))
- optimized native animations by batching multiple updates in single task ([9a9672fbbb](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9a9672fbbb36dcdaea40f220ccaedddc18e8c371))


## v0.72.31
- added support for `TextInput::inputMode`  ([b873539cd1](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b873539cd1719e64079d59bc8c5fcfaa5e222ed9))
- added support for `TextInput::contextMenuHidden` ([b873539cd1](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b873539cd1719e64079d59bc8c5fcfaa5e222ed9))
- added onHoverIn and onHoverOut support ([dd4b30ed38](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/dd4b30ed38e4a3f5d60939b86f8b6e8b5f963083))
- added `ArkTSMessageHub` to `TurboModule::Context` to allow TMs to listen to ArkTS messages ([8aeaf643bb](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/8aeaf643bbaaef79cb7665a17a957b906def9a04))
- fixed animation issues caused by Animated Scroll events throttling ([2579748710](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/25797487102bbb7282cc7154281de17661976deb))
- fixed setNativeProps for values which can be defined outside `style` object   ([e90d1cd744](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/e90d1cd744784175efb2b232161a617ab492c46e))
- fixed TextInput sometimes being covered by keyboard ([e482abc673](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/e482abc6732287f16052b3e24d5692e39bbe1787))
- fixed incorrect keyValue in onKeyPress when non-ASCII characters were in the input text ([37092cdc38](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/37092cdc386955e0b2dde227117d33fccd22c7eb))
- fixed ArkUI nodes' ids colliding in multi RNInstance environment ([04e23564e4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/04e23564e40d5e3eae6a44706b2ba773dd111c32))
- removed ArkTS `TimingTurboModule` ([8aeaf643bb](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/8aeaf643bbaaef79cb7665a17a957b906def9a04))


## v0.72.30
- deprecated `ComponentInstance::Dependencies::arkTsMessageHub` in favor of `arkTSMessageHub` ([59d7550bb4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/59d7550bb4629787ec0ecbfa4eeee0e93b2ad10c))
- added image prefetch support  ([6511bda8cf](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6511bda8cf0da47c3b61663ff385ca1692c89441))
- fixed cleaning up after ArkTS components — aboutToDisappear wasn't called when the ArkTS component was destroyed ([00e9ea3fbf](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/00e9ea3fbf201ecea6e60dd146c444dc05049c2f))
- maybe fixed crash — "Trying to send a message on websocket "0" but there is no socket." ([7001556e85](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/7001556e85dfa48c8dd57a50b8ec5d7dd09d6920))


## v0.72.29
- deprecated `ComponentInstance::Dependencies::arkTSChannel` in favor of `RNInstance::postMessageToArkTS` ([ca56635340](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3d15e2e7ed7c8424d5a8e1337aa26d28f7408c5f))
- deprecated `ComponentInstance::Dependencies::arkTsMessageHub` in favor of `ComponentInstance::Dependencies::arkTsMessageHub` ([ca56635340](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/ca56635340592d3f52de5447a8371a689660c6b0))
- added traces in RNOH code ([b2e6ce9ebc](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b2e6ce9ebc57992b0acce6ad01221a0ca5736881))
- added support for multiple abilities using RNOH in one bundle ([0873ca8e45](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/0873ca8e45348c66f84d26de3c333d51de33dd30))
- added `disableCleaningRNInstances` option to `RNInstanceCoordinator` and `onShouldDisableCleaningRNInstances` to `RNAbility` ([0873ca8e45](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/0873ca8e45348c66f84d26de3c333d51de33dd30))
- added `getNativeNodeIdByTag` method to `RNInstance` (ArkTS class) ([39d6962924](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/39d6962924ced6c1188c91205621928aeb437e0f))
- fixed issue with URL encoding in the `NetworkingTurboModule.sendRequest` ([61323e7fdd](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/k61323e7fdd8d91a7655db7438f3bdaaa037247d9))
- fixed a bug causing performance issues for large mutations ([1c380d38bc](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/1c380d38bc91e9dcd8b8fbde40806e7e25c0d20d))
- fixed useNativeDriver issue by running maybeStartAnimation on AnimatedNodesManager::connectNodeToView ([3741eddd27](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3741eddd27dab375e6a1cda86ad63b18d6d39716))
- fixed `XComponentSurface`s clean up on `MAIN` thread ([eb0a5bb9af](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/eb0a5bb9afd09b3a0b773471f40909ffb5d5d5f3))
- fixed onMomentumScrollEnd called instead of onScrollEndDrag ([3e44fc2279](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3e44fc2279c4b8e54b68bb4bf2beb6514bf13bc6))
- fixed `ScrollView`'s `onMomentumScrollBegin`, `onMomentumScrollEnd`, `onScrollDragEnd` ([6251ba80ea](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6251ba80ea93e0fbe7d7fb0e96c64d57d268bba0))


## v0.72.28
- deprecated `ComponentInstance::{setProps, setState, setLayout, setEventEmitter, finalizeUpdates (override onFinalizeUpdates instead), handleCommand (override onCommandReceived instead)}` — these methods will be inaccessible for library developers in the future ([8ccb62b664](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/8ccb62b66437f4b818c2c659b855605a9b091a3c))
- deprecated `HttpClientProvider` ([98cb478b05](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/98cb478b0592f21fec00a06f09e6795b37fff704))
- deprecated `DefaultHttpClientProvider` ([98cb478b05](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/98cb478b0592f21fec00a06f09e6795b37fff704))
- deprecated `RNInstancesCoordinatorOptions::httpClientProvider` ([98cb478b05](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/98cb478b0592f21fec00a06f09e6795b37fff704))
- deprecated `Package::createComponentInstanceFactoryDelegate` (C++) ([3e97be1e03](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3e97be1e038dc80e23b7397be40b6fe6ca0ad48a))
- deprecated `enableBackgroundExecutor` RNInstance option ([a009f7297e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a009f7297ea0b4e74b571cf229a9d86d9432bd65))
- deprecated `LayoutProps` interface (ArkTS) ([9af8a3b93d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9af8a3b93da01c3683e643963de7983674547699))
- deprecated `DescriptorRegistry::getDescriptorByTagMap` (ArkTS) ([9af8a3b93d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9af8a3b93da01c3683e643963de7983674547699))
- deprecated `OverflowMode` enum (ArkTS) ([9af8a3b93d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9af8a3b93da01c3683e643963de7983674547699))
- deprecated `Descriptor::isDynamicBinder` (ArkTS) ([9af8a3b93d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9af8a3b93da01c3683e643963de7983674547699))
- deprecated `DescriptorEssence` (ArkTS) ([9af8a3b93d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9af8a3b93da01c3683e643963de7983674547699))
- deprecated `BorderMetrics` type (ArkTS) ([9af8a3b93d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9af8a3b93da01c3683e643963de7983674547699))
- deprecated `ComponentBuilderContext::descriptor` (ArkTS) ([9af8a3b93d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9af8a3b93da01c3683e643963de7983674547699))
- deprecated `ComponentBuilderContext::rnohContext` (ArkTS) ([9af8a3b93d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9af8a3b93da01c3683e643963de7983674547699))
- added `TextInput::style::lineHeight` support (however, when `TextInput::multiline` is enabled, this feature is buggy) ([3984d4c061](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3984d4c0611062997c0abdb8c8052217c6e925ab))
- added `RNOHCoreContext::cancelTouches` ([6b919e42c4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6b919e42c4014cbb550894e79adde543bef26fc2))
- added `RNInstance::cancelTouches` ([6b919e42c4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6b919e42c4014cbb550894e79adde543bef26fc2))
- added Linking.addEventListener() support ([7ede6d70aa](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/7ede6d70aa21a955de8ff518ffc6d3dfd9507391))
- added option `RNInstanceOptions::disableConcurrentRoot` to disable React 18 features ([799122339f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/799122339f82ef6db483c1a43375137419896016))
- added removeClippedSubviews to ScrollView ([939713694d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/939713694d0bceffaf5ef0582b932787afa4b27a))
- added `getNativeResourceManager` method to `RNInstance` (CPP) to allow accessing the OHOS `ResourceManager` from RNOH ComponentInstances and TurboModules ([8682455562](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/8682455562f8fbb6437824ae6c6a673b92830d38))
- added `RNInstancesCoordinatorOptions::defaultHttpClient` ([98cb478b05](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/98cb478b0592f21fec00a06f09e6795b37fff704))
- added `RNAbility::onCreateDefaultHttpClient` ([98cb478b05](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/98cb478b0592f21fec00a06f09e6795b37fff704))
- added XMLHttpRequests's upload progress event handling ([9a1917dac9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9a1917dac9d21c0429323be7553c6b1457f9c294))
- added support for registering different native backpress handlers for each RNInstance used ([67c13f6f94](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/67c13f6f94cc4400518a2d062e8b203d0ce2761c))
- added `Package::createComponentInstance` method (C++) ([3e97be1e03](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3e97be1e038dc80e23b7397be40b6fe6ca0ad48a))
- added force parameter in TouchEvent ([89fd1328ff](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/89fd1328ffaaf35657e276ca1f3fa9cae27f8bf5))
- added a feature flag `enablePartialSyncOfDescriptorRegistryInCAPI` ([7257c545fc](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/7257c545fc2edce272e2f97a68314e58be0a67a8))
- fixed SafeAreaView not working in certain situations ([624f7d7f0e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/624f7d7f0e15cd9bda28bd33f09238af3f43faa2))
- fixed removed clipped throttling ([50d6856ee9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/50d6856ee97ec0ff1dcea84bc6004619faeb5e6b))
- fixed bug when `NativeAnimated.removeAnimatedEventFromView` is called with incorrect arguments ([730a482cb7](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/730a482cb76eee7656b828e150f1f0c907172d2d))
- fixed problem with getting right bounding box for animated views with values from useNativeDrivers ([837f6f544c](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/837f6f544c1a0cb590a409576593864af52d065e))
- fixed `Switch` `onValueChange` event firing when value is changed via prop ([6975516d05](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6975516d051934f33182a03fada1e4c7ab9f221a))
- fixed `Switch` value set by prop being overridden by user input ([6975516d05](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6975516d051934f33182a03fada1e4c7ab9f221a))
- fixes problems with cleaning up RNInstance when there was native animation running ([cfd30ed398](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/cfd30ed398796c301015fd5712da29d41ea869f5))
- fixed calling endCallback from JS thread instead of cleanup thread ([51ee0ec070](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/51ee0ec070767dd9fd4a8af6bf89bb28dbc58c21))
- fixed a use-after-free bug ([9a37f807b6](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9a37f807b6f70e46bdc4369bd318e4f0c1886f4f))
- fixed XMLHttpRequests timeout event ([9a1917dac9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9a1917dac9d21c0429323be7553c6b1457f9c294))
- fixes use-after-free issues with native vsync listeners in Animated ([197a39392a](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/197a39392a75219b78efe9e3171ac2b9a3fcc1d9))
- changed default values for ScrollNode scrollTo animation ([976262dfc9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/976262dfc94a623748bcdc6b493cb2ed832e25c9))
- changed the default background color of StatusBar ([2db53d46f0](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/2db53d46f0fd8e28a75f895651421863a9c7e09c))
- handle `ViewEvents` props in ViewComponentJSIBinder ([8e3882ee3e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/8e3882ee3e06819a0f9c0ec2b71259e6b209299d))


## v0.72.27
 - [breaking] added codegen support for C-API architecture (in the cli package v0.0.26). This change is breaking for RN app developers. They need to update their `harmony/entry/src/main/cpp/CMakeLists.txt` to support packages that rely on this feature by defining `RNOH_GENERATED_DIR` variable. RN app developers are expected to use the latest CLI version, because if a package is migrated before an application that depends on that package, the project won't compile. RN library developers can use codegen for C-API architecture by specifying `package.json::harmony::codegenConfig::version: 2` in their packages. The `codegenConfig` property now also supports a list of configs to allow developers to generate code for both RNOH architectures. In version 2, passing objects through a component property is not supported — the application won't compile. This issue may require updating `react-native`. ([59cc716e30](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/59cc716e30ef55ebb2880ba32d9123a6a0955844))
- deprecated `ComponentManagerRegistry::registerComponentManager` ([40cdf653c3](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/40cdf653c3e2ac14ba038cb97297c10be41eec65))
- deprecated `convertColorSegmentsToString` ([40cdf653c3](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/40cdf653c3e2ac14ba038cb97297c10be41eec65))
- deprecated `convertColorValueToRGBA` ([40cdf653c3](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/40cdf653c3e2ac14ba038cb97297c10be41eec65))
- deprecated `BorderEdgePropsType` ([40cdf653c3](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/40cdf653c3e2ac14ba038cb97297c10be41eec65))
- deprecated `resolveBorderMetrics` utility function ([40cdf653c3](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/40cdf653c3e2ac14ba038cb97297c10be41eec65))
- deprecated `resolveBorderRadius` utility function ([40cdf653c3](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/40cdf653c3e2ac14ba038cb97297c10be41eec65))
- deprecated `resolveBorderEdgeProps` utility function ([40cdf653c3](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/40cdf653c3e2ac14ba038cb97297c10be41eec65))
- added `--no-safety-check` to `react-native codegen-harmony` that disables checking if path is in CWD before cleaning up directory for codegen output ([59cc716e30](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/59cc716e30ef55ebb2880ba32d9123a6a0955844))
- added Deprecation Policy document ([643a872b82](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/643a872b82880b8ef8dbed3e736366e423c628d2))
- added XMLHttpRequest.withCredentials support (cookie handling) ([b10f01b53d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b10f01b53d15938bf09520027f12bf6c13e11b07))
- added proper offset to touches ([bc86521901](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/bc865219016b19af329ba41a003c3e7a443563db))
- added incrementalUpdates (onProgress) handling in NetworkingTurboModule ([2de583c831](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/2de583c831eb085ec1a86c032d9c0206e9605b2c))
- added support for RefreshControl's RefreshIndicator size property for C-API ([fdc11dd95e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/fdc11dd95e24139d9bea9cc6b7eb6abd857fcd9f))
- added support for ActivityIndicator size property for C-API ([fdc11dd95e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/fdc11dd95e24139d9bea9cc6b7eb6abd857fcd9f))
- fixed blocking and unblocking native responder not taking effect ([85b9840e7d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/85b9840e7d2133b61f4530a138dc6b070a320e22))
- fixed nested text touch handling when multiple fragments have the same press callback ([8172368640](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/817236864091477ff7e3cfb65988aad2420236c9))
- fixed text fragments handling touches before attachments, despite being drawn under them ([8172368640](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/817236864091477ff7e3cfb65988aad2420236c9))
- fixed Text touch point calculations when paragraph attributes change ([d37ba1f8c1](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/d37ba1f8c147a2e042159b4cf743103b8daf9ff2))
- fixed JS callbacks passed to ArkTS being cleared prematurely ([1c4e1b142d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/1c4e1b142db3335be3104803eb9e38f8eb582bd8))
- fixes how native node IDs are set by default ([adb80ca94b](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/adb80ca94b060632e13ac05500cfe4a04ed430c6))
- fixed how perspective transform is applied ([7c14eaf633](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/7c14eaf633dcdd3365e19891f97d9457ade775ba))
- fixed setting `opacity` for views with animated `transform` ([2e3353dcb9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/2e3353dcb98c91dfdf989d301708ec1189fff335))
- fixed `ScrollView::contentOffset` not set at the first render ([6fcb800859](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6fcb800859e76a0df3cb3d470d8d5290d6c7e9dc))
- fixed `pointerEvents: "none"` ([c6537e1266](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/c6537e1266ba3998e92bec0cb7006a30d5c4463e))
- fixes event counter update mechanism in ArkTS TextInput implementation ([11daea8773](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/11daea87735bcb28ff4fb4ba4ce51c80e4061523))
- fixed aligning in SafeAreaView ([8ba47eece9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/8ba47eece96bdf627608000bfc06248f134ee716))
- fixed `TextInput` hanging when fontSize is not provided ([f5a248d007](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f5a248d007bfa670ad09705671a52fbfdcf690c4))
- fixed touches being off in Scrollable components during refreshing using RefreshControl ([00c64aafd2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/00c64aafd28a7a933633483bb3f8422441c200ad))
- fixed input being filtered out when it does not match the selected keyboardType on ArkTS architecture ([32d16d0655](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/32d16d0655271091c172e89df177ce0c17c8d348))
- fixed pointerEvents not being applied when set on the TextInput component on ArkTS architecture ([32d16d0655](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/32d16d0655271091c172e89df177ce0c17c8d348))
- fixed sending and receiving arraybuffer to/from the WebSocket server ([ca71e6ee37](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/ca71e6ee37b508d0fe2279e3b9c3598b6b897242))
- fixed memory leak in DescriptorRegistry ([97f3fe935b](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/97f3fe935b583a2b8635775b5bd5779168952e07))
- fixed `snapToOffsets` and `snapToInterval` still being applied after unsetting them ([399fbefadf](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/399fbefadf5d501152e4a1be1edef45106c144d9))
- fixed nested ScrollViews triggering parent scrolling when scrolled beyond its content right after initialisation ([399fbefadf](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/399fbefadf5d501152e4a1be1edef45106c144d9))
- schedulerdelegatecapi::schedulerdidsetisjsresponder now calls ComponentInstance::setNativeResponderBlocked asynchronously. ([20df62fab9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/20df62fab95637850c0139bc0955247fa945ee57))
- ensured calling the onAction callback only once in AlertManagerTurboModule ([230b4ead92](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/230b4ead921524d836573108bfdd929d71f8506d))
- always use properties from `ViewProps` in `CppComponentInstance` ([fd986c8211](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/fd986c8211ce6203a414f816f097c311be55f2c3))
- fixed TextInput by preventing sending onChange events when value is changed from state rather than typing ([0d0a3a4576](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/0d0a3a4576e87760c8e4c5defc78b4355027be73))


## v0.72.26
 - added TouchTarget::getCurrentOffset method ([e2d3a5424f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/e2d3a5424f1bad6d59892bcad79246e981edff1b))
- added doc comments ([fd99f5dc98](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/fd99f5dc98cee883f0cff3e5fc1dc1a0e32d515d))
- added delegate releasing asyncHandle to the uv_close function call in class destructor. ([30d553764e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/30d553764efdc1e119d0bdf5ab82fa9dde198ed9))
- wrapped NapiTaskRunner::asyncHandle into a pointer ([30d553764e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/30d553764efdc1e119d0bdf5ab82fa9dde198ed9))


## v0.72.25
 - [breaking] changed signature of `RNOHCoreContext.createAndRegisterRNInstance` ([a52a79cfee](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a52a79cfee2394977d431d064f136f9b3c3dbde1))
- added support for `ScrollView::maintainVisibleContentPosition` ([c51f235c57](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/c51f235c577abd5ebf6abe48e173eb493dc14c31))
- added support for setting `FrameNodeFactory` on an existing `RNInstance` ([a52a79cfee](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a52a79cfee2394977d431d064f136f9b3c3dbde1))
- added allowRTl ([3b2eaede1f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3b2eaede1f3350507d0c61a7576c5c196692444d))
- added forceRTL ([3b2eaede1f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3b2eaede1f3350507d0c61a7576c5c196692444d))
- added getConstants ([3b2eaede1f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3b2eaede1f3350507d0c61a7576c5c196692444d))
- moved initializing `FrameNodeFactory` to `RNSurface` (application code should not create its own `FrameNodeFactory` instances) ([a52a79cfee](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a52a79cfee2394977d431d064f136f9b3c3dbde1))
- improved error handling when no FrameNode is provided ([a52a79cfee](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a52a79cfee2394977d431d064f136f9b3c3dbde1))


## v0.72.24
- added: setHeight/setWidth/setTranslate/setMargin/setPadding/setVisibility in ArkUINode ([7bb94f9db7](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/7bb94f9db76ff3bedc6be78b79cccacfaed708b4))
- added support for `RefreshControl::enabled` ([4bbecc3810](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/4bbecc38105f2e7898f95d4f77483e8d52bdc721))
- added onWindowStageChange in RNAbility ([51cf9aaf61](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/51cf9aaf617994ddf43bbccb47a786b5ca135860))
- added StageChangeEventArgsByEventName in RNInstance ([51cf9aaf61](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/51cf9aaf617994ddf43bbccb47a786b5ca135860))
- added onWindowStageChange in RNInstancesCoordinator ([51cf9aaf61](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/51cf9aaf617994ddf43bbccb47a786b5ca135860))
- added listeners in AppStateTurboModule ([51cf9aaf61](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/51cf9aaf617994ddf43bbccb47a786b5ca135860))
- added ArkUI properties (enableStatusBarAnimations) but they are not working yet ([f9262857e9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f9262857e96568f80ab4567b05ca29ab7e0058bf))
- added support for `progressBackgroundColor`, `title` and `titleColor` for `RefreshControl` in C-API architecture ([49fd649b4f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/49fd649b4f05925bf32311b9e3e8a359d12f06a3))
- added null check into onConfigurationUpdate() ([fb172fb9d7](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/fb172fb9d7efc8156231da19c6a3cdc744eb2b81))
- added HttpClient ([8a1bc5fab8](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/8a1bc5fab8758395248550002572e0b8e930b19d))
- added `Modal::onOrientationChange` ([e28f54a321](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/e28f54a321f2cab1229a6b5d61dacd408c66011f))
- added NODE_TEXT_WORD_BREAK support  ([0e07813df7](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/0e07813df70fb367ed07234d17ddaa4e448f3cdc))
- added support for `TextInput::selectTextOnFocus` ([92ae1e1eb9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/92ae1e1eb91c1e96098f2c4e572404ba609bea2d))
- added support for `TextInput::selection` in multiline ([92ae1e1eb9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/92ae1e1eb91c1e96098f2c4e572404ba609bea2d))
- added full support for `TextInput::onKeyPress` in multiline ([92ae1e1eb9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/92ae1e1eb91c1e96098f2c4e572404ba609bea2d))
- added test for ToastAndroid duration constants ([f857f1e73f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f857f1e73f5fa891032a681633792be99d344147))
- fixed the Scroll bouncing back on first scroll when nested in another Scroll. ([1d24eddbcb](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/1d24eddbcba1fd50d6b26a6bf5b7525c98f2ad6a))
- fixed animated views jittering when they are rerendered by React ([934d5d237e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/934d5d237e9b57062dc6177b8b2787f198a441b2))
- fixed issue with 0-sized views being incorrectly positioned by ArkUI ([499613f907](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/499613f90756a4f2680b67b19d7fc1400002e098))
- fixed touches for non-ASCII text fragments ([644e022fcd](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/644e022fcd443c23a2c9f89c62ebcd1b05d6d4f7))
- fixed deadlock when trying to `postMessageToCpp` from a `cppEventEmitter` listener ([8ca81da316](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/8ca81da3160bfc6a1e23a3731f02a3dea1bbb0dc))
- changed `ScrollView` child point calculation to take into account content centering ([b44780cfe9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b44780cfe96dc2dde3f5e8d5b6c241927f681ae9))
- changed `Modal` display size to rely on window size rather than screen size to allow proper display in split screen mode ([e28f54a321](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/e28f54a321f2cab1229a6b5d61dacd408c66011f))
- removed setMargin in StackNode ([7bb94f9db7](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/7bb94f9db76ff3bedc6be78b79cccacfaed708b4))
- updated ~RNInstanceCAPI thread-related codes ([bd729ca9f5](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/bd729ca9f553008462f52cf22b59f1eb1190dcf5))
- manually setting color in StatusBar inside setInterval function (similar to Android implementation) ([f9262857e9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f9262857e96568f80ab4567b05ca29ab7e0058bf))
- implemented progressOffsetView of ArkUI Architecture ([48fca87ec0](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/48fca87ec056b046551b78f876a57f5bb662781b))


## v0.72.23
- added Image's `loadingIndicatorSource` support in both architectures ([32787795ca](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/32787795ca075b1fe25e9807924fbb7c1e5304b3))
- fixed har file not being included in the npm package ([f5e07d7791](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f5e07d77916ab593af7a83dbc17b88d57cd6d3e8))
- fixed AppState listeners not being called ([2405372295](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/2405372295e963ee1983c9e2b3b75a05cd25c978))


## v0.72.22
- [breaking] react-native-openharmony ships with a har file rather than module.tgz - pack-harmony and unpack-harmony should no longer be needed and they will be removed in the future
- added setting native node `id`s to `testID` or `nativeID` prop values ([6a7d0a5cc3](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6a7d0a5cc373c7a01331c1515218f31e2ab19d9c))
- changed blocklist in metro configuration ([aba0358d36](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/aba0358d369ca9dbd3515959dfbd9e5106f9ca92))
- reverted code added in this PR - while this fixes touches, it breaks some styling in ScrollView with RefreshControl but working touches seems more important ([5872d9629a](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/5872d9629a51d7ce6ceaa565aa688222c0940ae5))
- support alignment in text measurement, calculate the correct position for children views ([6092118b76](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6092118b769f88dfe6e1570dc1053bcc5f16d7ed))
- support setting `TextInput` component's contents by setting its `children` ([569513d344](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/569513d3444bb55cefbdbf9c419871a8cc8e0d44))


## v0.72.21
- [breaking] `onWindowSetup` is now private and was renamed to onAppSetup - use one of the following methods onPrepareRNInstance, onWindowSetup, or onWindowStageSetup instead ([98682eb3bf](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/98682eb3bf7e6284647843f599ca37cf87c94f60))
- added onKeyPress event ([e9887ef98c](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/e9887ef98cd9e3594432e2228a8c0bc0df268c6c))
- added support for `ScrollView::disableIntervalMomentum`  ([17f45cea3f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/17f45cea3fc161b9b7be3ea16987a43c0cbec885))
- added sorting `snapToOffsets` before passing them to ArkUI node - the ArkUI snapping is not working when the offsets are not ordered  ([17f45cea3f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/17f45cea3fc161b9b7be3ea16987a43c0cbec885))
- added passing `INFINITY` as a last snap if `snapToOffsets` has only 1 element to tackle bug #988  ([17f45cea3f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/17f45cea3fc161b9b7be3ea16987a43c0cbec885))
- add overridable `defaultBackPressHandler()` to `RNAbility` ([35e4bf30fa](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/35e4bf30fa0e7a5670a50651c75cca787c849320))
- add `defaultBackPressHandler` to `RNInstanceCoordinator` dependencies ([35e4bf30fa](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/35e4bf30fa0e7a5670a50651c75cca787c849320))
- added `react-native verify-package-harmony` CLI command ([7d4ef1fe4a](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/7d4ef1fe4aed20708542d17f98d6af8a4735478e))
- add `ScrollView::contentOffset` prop support ([a324775f09](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a324775f090e59f6a63b04b377ef22ec8c5be3fb))
- added missing C_API tags ([b93b924a9c](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b93b924a9ced15f7ccc1a25fab58a8080ca7edec))
- added build-profile.json5 in react_native_openharmony folder ([996de9afb7](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/996de9afb759d6940f9712b7b98f4a08082aef04))
- added event counter to TextInput in C-API architecture. ([9ddcf52121](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9ddcf5212144793274593dac09b76163b0f4a7c0))
- adds default issue template for bug reporting ([db2a63a5da](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/db2a63a5da1847a0d9664045871cf5caf7116f21))
- added tests for View::NextFocus and Button::NextFocus ([5f7e94cdbd](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/5f7e94cdbdd1e99580a6f9b2eab18077b199a754))
- added additional test for loading images from different subfolders. ([5dde8e1adf](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/5dde8e1adfc4a08c364e892c481257fcdb47b5dd))
- added support for setting different padding on each edge in `TextInput` ([725bf8fa08](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/725bf8fa08f80b1c26ac6f6488ad3849f720c2d6))
- added `resolveEdges` method that resolves `YogaEdges` object into `RectangleEdges<>`  ([725bf8fa08](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/725bf8fa08f80b1c26ac6f6488ad3849f720c2d6))
- added `RNInstancesCoordinator` ([de24f8e125](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/de24f8e1257438235226ce52b205f5f344916abf))
- added test for that case ([f5576361ba](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f5576361bad8f272312fc15f4d2c9fecb87c69e0))
- add lazy bounding box calculation ([d0cf8628fd](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/d0cf8628fdc64cb1b6b89c30ae6105d43d34d068))
- fixed root `Modal's` root `Stack` node's position to `{0,0}` . ([2d1826f9ef](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/2d1826f9efb61920bdff8c448ddd841244829734))
- changed order of event firing ([e9887ef98c](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/e9887ef98cd9e3594432e2228a8c0bc0df268c6c))
- changed oh module and package name (third party libraries should import from `@rnoh/react-native-openharmony` instead of `rnoh`) ([41eff41379](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/41eff4137968b8d08bb5583efffb563d925f57f8))
- changed the `backgroundColor` of `TextInputNode` and `TextAreaNode` to `transparent` when the property is not set ([f5576361ba](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f5576361bad8f272312fc15f4d2c9fecb87c69e0))
- removed build-profile.json5 in react_native_openharmony folder from .gitignore ([996de9afb7](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/996de9afb759d6940f9712b7b98f4a08082aef04))
- settet NODE_TEXT_INPUT_ENABLE_KEYBOARD_ON_FOCUS to True in TextInputNode constructor. ([a50d7edef8](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a50d7edef885c0f8000f56ba60ce80a5935c60c5))
- call `defaultBackPressHandler()` in `DeviceEventManagerTurboModule.invokeDefaultBackPressHandler`  ([35e4bf30fa](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/35e4bf30fa0e7a5670a50651c75cca787c849320))
- unskip relevant tests ([a324775f09](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a324775f090e59f6a63b04b377ef22ec8c5be3fb))
- refactor of SectionList tests ([b93b924a9c](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b93b924a9ced15f7ccc1a25fab58a8080ca7edec))
- refined RNOHCoreContext ([de24f8e125](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/de24f8e1257438235226ce52b205f5f344916abf))
- nested scrolling is now handled manually ([dc879c4aac](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/dc879c4aac75a5a98f881a676005040d7ea79c5b))
- when a child Scroll is scrolled from its end towards the outside, the parent Scroll starts scrolling ([dc879c4aac](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/dc879c4aac75a5a98f881a676005040d7ea79c5b))
- when a child Scroll is scrolled from its end towards the inside or it is scrolled from its inside, the parent Scroll will not start scrolling when the child's end is reached ([dc879c4aac](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/dc879c4aac75a5a98f881a676005040d7ea79c5b))
- bouncing is now turned off in nested Scrolls whose content size is smaller than container size (just like on iOS) ([dc879c4aac](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/dc879c4aac75a5a98f881a676005040d7ea79c5b))
- conditional include for libqos ([233029f294](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/233029f29488fdddd2012bbea4fdb17f68551fe7))
- logging warning when calling setTaskThreadPriority on C_API_ARCH disabled ([233029f294](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/233029f29488fdddd2012bbea4fdb17f68551fe7))
- unskipped passing tests in `ModalTest.tsx` ([2d1826f9ef](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/2d1826f9efb61920bdff8c448ddd841244829734))


## v0.72.20
- added Systrace support
- fixed nativeEvent timestamps unit

### ArkTS architecture
- added support for placing images in a custom assets directory
- fixed ScrollView styles when using RefreshControl
- fixed changing TextInput value

### C-API architecture
- various touch handling improvements
- added ScrollView events support in Animated 
- added support for touches in nested Text components
- added TextInput support
- fixed ScrollView alignment
- fixed dynamically changing number of lines in a Text component
- fixed TextInput default padding and caret color
- fixed touches not being cancelled
- improved error handling

## v0.72.19
- added basic Share module support
- fixed Linking::openSettings

### ArkTS architecture
- added TextInput::contextMenuHidden support

### C-API architecture
- added RefreshControl support
- added Text specific props support
- added Modal support
- added ArkTSTurboModule::callSync method that can be used to call turbo modules from ComponentInstances
- added a way to block scrolling

## v0.72.18
### ArkTS architecture
- added LogBox support
- added Image::onLoadEnd support
- added Image::defaultSource support
- fixed Image position not being updated properly
- fixed dimensions not being set correctly when they were set to 0
- fixed crashes due to Image cache issues
- fixed displaying error dialog
- fixed dismissing alerts

### Experimental C-API architecture
- added common View props support
- added Native animations support
- added transform style prop support
- added ActivityIndicator support
- added common ScrollView props support
- added common Switch props support
- added common Image props support
- added basic backward compatibility with ArkTS arch
- changed the design of CppComponentInstance class

## v0.72.17
- added foundations for an experimental C-API based architecture
- added optional approach of building components based on LazyForEach and DataSources that provides better performance
- added `TextInput::onSelectionChange` support
- added `TextInput::selection` support
- added `TextInput::selectTextOnFocus` support
- optimized disk caching of Images
- fixed react-native codegen crash when generating code
- fixed `Switch::value`
- fixed `Image` intercepting touches when it shouldn't

## v0.72.16
- BREAKING: removed dependencies on RNAbility in RNOHContext
- added internal import resolving for harmony packages with `redirectInternalImports: true`
- added support for `ToastAndroid`
- added `enableNDKTextMeasuring` feature flag which allows optional faster text measuring using NDK
- added support for Appearance API
- restored partial support for `TextInput::onKeyPress`
- fixed `Alert` breaking when created without any buttons
- fixed websockets not connecting after updating to API 11
- fixed `fontHeight` calculations
- fixed `Modal` being shifted up by soft keyboard instead of being covered
- fixed `RefreshControl` not working correctly in nested `ScrollViews`
- fixed `Touchables` not detecting all touches when nested in `ScrollView`
- fixed `topLayout` event being unsupported

## v0.72.15

- BREAKING: deprecated `RNComponentFactory` in favour of `wrappedCustomRNComponentBuilder` 
which must now be provided to `RNApp` ([!797](https://gl.swmansion.com/rnoh/react-native-harmony/-/merge_requests/797))
- BREAKING: `RNSurface` expects `RNComponentContext` instead of `RNOHContext` ([!797](https://gl.swmansion.com/rnoh/react-native-harmony/-/merge_requests/797))
- BREAKING: asset file names in HAP resources are now hashes of the asset path instead of encoded asset paths ([!810](https://gl.swmansion.com/rnoh/react-native-harmony/-/merge_requests/810))
- added imports hijacking support for packages with no harmony native code
- added `Modal::animationType` support
- added support for loading assets from Metro dev server
- added partial `TextInput::clearButtonMode` support
- added `FileJSBundleProvider` for loading bundles from device filesystem
- fixed errors when trying to access unimplemented `UIManager` functions
- fixed issues with `TextInput` updates not applying correctly
- fixed `Text::textShadowRadius` not being applied correctly
- fixed `Image` errors not being reported correctly
- fixed `Dimensions` display metrics not updating on window size changes
- fixed `ScrolLView::scrollToEnd` not scrolling when called after `onLayout`
- fixed `TextInput::value` and `TextInput::defaultValue` no applying correctly
- fixed `RNApp` not being covered by the virtual keyboard

## v0.72.14

- added `DevSettings::addMenuItem` support
- added `TextInput::onEndEditing` support
- added Codegen support
- added `BlobTurboModule` support
- added JS debugger and profiler support
- disabled background thread by default
- fixed crashes in `Image`
- fixed scrolling issues when `ScrollView` contains a collapsable `PanResponder`
- fixed crashes connected to TextHeightAdaptivePolicy
- fixed crashes upon `RNInstance` destroying
- fixed deadlocks related to text measurements when shutting down surface
- fixed `View::pointerEvents::box-only`
- fixed `Modal` component not adapting to window size changes

## v0.72.13
- added `View::focusable` support
- added `DevLoadingView` support
- added `Text::adjustFontSizeToFit` support
- added RedBox support
- added LogBox support
- added Layout inspector support
- added `DevMenu` support
- added hot reloading support
- added `TextInput::allowFontScaling` support
- added `Image::resizeMethod` support
- removed `TextInput::onKeyPress`
- fixed errors on loading `Image`
- fixed border displaying in `Image`
- fixed nested scrolling issues
- fixed `textAlign: justify`
- fixed timers not being cleaned up when TimingTurboModule was destroyed
- fixed `Modal` not changing position after screen rotation
- fixed `TextInputState` issues
- fixed `TextInput` sending change event when value changed in props
- fixed large bundles not being able to load from Metro
- fixed issues with instance cleanup
- fixed `ScrollView` offset not updating after content size changed
- fixed native responder unlocking too soon
- fixed problems with disabled components intercepting touches
- fixed issues related to app teardown
- fixed `RefreshControl::progressViewOffset`
- fixed crashes with NativeAnimated destructor
- fixed crashes when using `PanResponder`
- fixed crashes on subsequent app starts
- fixed `Animated.View` props animations
- fixed `onPress` in nested `Text`

## v0.72.12
- added `ScrollView::inverted` prop support
- added more detailed logs
- added `ScrollView::maintainVisibleContentPosition` support
- added `TextInput::clearOnFocus` support
- added `hints` support:
  - `debug` hint
  - `ready` hint
- added `RNInstance::blockComponentsGestures` method
- added error handling for errors thrown from turbo modules
- fixed unnecessary text wrapping issue
- fixed touches when transform was provided
- fixed image sometimes not changing on source change
- fixed imports not being hijacked to scoped third-party harmony packages
- fixed `fontColor` in `TextInput`
- fixed opacity exceeding the range
- fixed some props sometimes not being provided to native components
- fixed RefreshControl behavior
- fixed inserting ellipsis when `Text` has padding
- fixed opacity not being animated when using layout animations
- fixed reacting on dimensions change on devices with folding screen
- fixed aggressive page snapping

## v0.72.11
- BREAKING: `react-native-harmony/metro.config` exports now a function that creates configuration instead of configuration
- added `TextInput::keyboardType` support
- added a way to replace implementation of any RN component
- added custom fonts support
- added animated gif support in `Image` component
- added http redirects support in `Image` component
- added `arrayBuffer` response type support in `fetch`
- added `Animated.{diffClamp, tracking, modulus}` support when native driver is enabled
- added `I18nManager::isRTL` support
- added data URIs in `Image`
- added basic `RefreshControl::progressViewOffset` support
- added `console.log` support
- added Image::alt support
- added padding support in `TextInput`
- added `ScrollView::snapToStart/End` support
- added `TextInput::onBlur` support
- added sms schema support in `Linking` module
- added `TextInput::onKeyPress` support
- added `requireNativeComponent` support
- added `RootTagContext` support
- added `ScrollView::pagingEnabled` support
- added `ScrollView::snapToAlignment` support
- added `ScrollView::flashScrollIndicators` support
- added `ScrollView::disableIntervalMomentum` support
- fixed text being slightly bigger than views containing that text
- fixed infinite `TextInput::value` updates
- fixed crashes when view inside text was trimmed by `numberOfLines`
- fixed deadlock when using multiple surfaces
- fixed touch issues caused by not unregistering component managers properly
- fixed `textDecorationLine` color
- fixed `ScrollView` position when content size changes
- fixed freeze caused by having multiple empty lines in `Text` component
- fixed font style not being applied to `TextInput::placeholder`
- fixed jittering sticky headers
- fixed precision of layout positions and dimensions
- fixed jumping animations, when a render happens during native animation
- fixed vertical alignment of text and attachments inside `Text`
- fixed displaying multiple attachments on top of each other in `Text`
- fixed padding in `Text` component
- fixed WebSocket error handling
- fixed `VirtualizedList::initialIndex`
- fixed `TextInput` autofocus outside of modal
- fixed `PlatformConstants::reactNativeVersion` format

## v0.72.10
- breaking change: SurfaceHandle::start is now async
- added basic support for KeyboardAvoidingView
- added Model to Platform.constants
- added Image::onLoad support
- added basic TextInput::autoFocus support
- fixed loading remote images when urls is redirected
- fixed presses for views with translations animated with native driver
- fixed text wrapping after characters
- fixed onBlur crashing the app
- fixed empty values in TextInputs
- fixed maxLength in TextInput
- fixed nested scroll views
- fixed RNViewManager::parentTag incorrectly returning undefined
- fixed Text's onLayout
- fixed deadlock caused by creating/updating/destroying surfaces
- fixed unnecessary text wrapping
- fixed locking scroll from component manager

## v0.72.9
- breaking change: SurfaceHandle::stop and SurfaceHandle::destroy are now async
- added hitSlop support
- added basic onBlur support
- added support for TextInput content passed in onFocus event
- added basic useColorScheme support
- added Animated.decay support
- added Animated.spring support
- added ScrollView::scrollToEnd support
- fixed incorrect lineHeight calculation
- fixed onPress not firing when view and pressable were flattened
- fixed onPress working unreliably
- fixed TextInput autofocus
- fixed TextInput::value
- fixed wrapping of Chinese characters
- fixed single view in Text crashing the app
- fixed not working props for multiline TextInput
- fixed Animated.Value callback timing issue
- fixed deadlock caused when creating/destroying surfaces

## v0.72.8
- added layout animations support
- added ellipsis support when text components are nested or text component inside another text component
- fixed timer behavior when an app is in background
- fixed text input styling issues
- fixed `fetch`
- fixed errors reported by new ArkTS linter
- fixed app crashes caused sometimes caused by touches

## v0.72.7
- added ScrollView::persistentScrollbar
- added ActivityIndicator support
- added Text props/styles support:
  - vertical alignement
  - letter spacing 
  - selectable
  - ellipsizeMode
  - disabled
  - textShadow
- added View::borderStyle
- added ScrollView::contentOffset prop support
- added edge specific border width support
- added overflow support
- added ScrollView::scrollEnabled support
- added ScrollView::indicatorStyle support
- added ScrollView::decelerationRate support
- added basic linking API support
- added an option to blur images
- added nested text support
- added views inside text support
- added hermes bytecode bundles support
- added basic Keyboard module support
- added SafeAreaView support
- support TextInput props:
  - editable
  - caretHidden
  - maxLength
  - selectionColor
  - secureTextEntry
  - placeholder
  - placeholderTextColor
- fixed custom RefreshControl components
- fixed timers not being paused when the app is in background
- fixed awaiting JS Bundle execution
- updated React Native to 0.72.5
- changed approach to handling touches
  
## v0.72.6
- added support for Switch:disabled
- added support for Animated.Value listeners
- added Image.getSize support
- added Image::resizeMode prop support
- added RefreshControl component support
- added Text::textDecoration and Text::textDecorationColor support
- added iOS View shadow props support
- added support for multiple RN Instances and surfaces
- added border edge specific colors
- added interface JSBundleProvider
- added Image::tintColor support
- added ComponentManagers
- added Image::prefetch support
- added Text::padding support
- added View::borderStyle support
- fixed DrawerLayoutAndroid causing compilation errors
- fixed flickering modal contents
- fixed bundle-harmony arguments
- changed assets directory
- fixed deadlock caused by timing and animated turbo modules

## v0.72.5
- added support for Switch component
- reexported DeviceEventEmitter and findNodeHandle
- improved logging fatal errors
- fixed ScrollView offset when a ScrollView had a border
- fixed tap not stopping scrolling

## v0.72.4
- BREAKING CHANGE: replaced `EventEmitterRegistry.cpp` with `ShadowViewRegistry.cpp`
- added `Modal` component support
- added an option to set CPP state from eTS
- added Addition, Subtraction, Multiplication, and Division Animation Nodes
- fixed transforms
- reexported `dispatchCommand` method for custom fabric components that don't use code generation utility

## v0.72.3
- fixed TextInput not working correctly since v0.72.0
- fixed crashing on Open Harmony 4.0.8.5

## v0.72.2
- BREAKING CHANGE: renamed harmony module from `@ohos/rnoh` to `rnoh`
- BREAKING CHANGE: changed the interface of `EventEmitRequestHandler` and `Package::createEventEmitRequestHandlers`
- added support for `pointerEvents`
- added support for scroll driven animations to  native driver
- added support for horizontal scrolling
- added support for `BackHandler.exitApp()`
- various memory management tweaks that probably fix some memory leaks
- bumped react-native-harmony-cli to fix crash caused by `node_modules/.bin` when unpacking harmony modules

## v0.72.1
- fixed react-native unpack-harmony not replacing the native module when updating npm package
- fixed crash when removing a scrolling ScrollView
- fixed color transformation for custom components when a NapiBinder was not provided
- fixed an error thrown by React Native renderer caused by dispatching wrong touch events 
- fixed `collapsable` property
- fixed `onLayout` property
- fixed `FlatList` displaying wrong items
- added development mode (which can be disabled by using `prod` flag: `react-native bundle-harmony --prod`)
- added caching text measurements
- added a basic support for a native driver
- added back button handler - requires adapting `entry/pages/Index.ets` code, since listener for back button callbacks can only be added to the entry component
- removed rnInstance property from RNOHContext in favor of rnInstanceManager
- 
## v0.72.0
- upgraded React Native from 0.71.3 to 0.72.0
- added support for transform properties
- added support for momentum scroll events
- improved setTimeout by respecting native call delay
- fixed layout issues after hiding status bar

## v0.0.20
- added RNBaseView in order to share common styles and handlers with custom components
- added ability to provide custom logger
- added text width measurer (height must be provided)
- added support for nesting Text components
- added support for specifying border radius per corner
- added support for text alignement
- added ability to overwrite bundle loading code
- added basic support for StatusBar
- improved rendering performance
- styles support should be similar across various components
- fixed drawing order
- fixed touches in ScrollView

## v0.0.19
- breaking change: changed interface on the native side
  - made the `RNAbility` more robust
- improved lifecycle management
- fixed background/border colors updates
- added an option to send initialProps from native side to RN app

## v0.0.18
- breaking change: removed `@Provide`/`@Consume` from RNOH components to improve performance
- fixed source of fatal crashes
- fixed default colors
- added a event communication channel for third party libraries
- added support for AppState
