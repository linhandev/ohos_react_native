# Changelog

## v0.75.3
- [breaking] removed ReactCommon directory — app developers are expected to specify `RNOH_REACT_COMMON_DIR` in their entry CMakeLists file ( `set(RNOH_REACT_COMMON_DIR "${NODE_MODULES}/@react-native-oh/react-native-core/ReactCommon")`) ([c79e9e23e4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/c79e9e23e4755d3f0f2822e89818620c1d0a072e))
- [breaking] added a new peer dependency `react-native-core` ([c3ef1b0937](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/c3ef1b0937ad8db0bd57a6e3e1b675318511d911))
- deprecated `ArkUINode::setHitTestMode` (hitTestBehavior is now set by listening to NODE_ON_TOUCH_INTERCEPT) ([d12fcff142](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/d12fcff142e35f32fa40dce16d5f22d46572adcd))
- added support for calling callbacks passed from JS to TMs multiple times ([afc45f1e00](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/afc45f1e005560c408c23794006eee1b36eb343c))
- added init-harmony command ([0f5d44ef79](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/0f5d44ef79197f827d3f3f886fb6a602c8ba74a2))
- added `NODE_BY_HANDLE` to save `ArkUINode` by `ArkUI_NodeHandle`. ([ef75f23b47](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/ef75f23b474b3eece32d16873ac5919e99098dcc))
- added `ArkUINodeDelegate::onArkUINodeTouchIntercept` ([d12fcff142](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/d12fcff142e35f32fa40dce16d5f22d46572adcd))
- fixed incorrect transforms in more complex scenarios ([02c240af3e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/02c240af3ee592adbbbd4800989ff5b32c62ad6b))
- fixed Button default style ([c3ef1b0937](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/c3ef1b0937ad8db0bd57a6e3e1b675318511d911))
- fixed repeating vibrations ([c3ef1b0937](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/c3ef1b0937ad8db0bd57a6e3e1b675318511d911))
- fixed application flooding logs with errors when trying to reconnect to Metro ([ab1b77a82a](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/ab1b77a82aca1bed3d0892c99bd42288a5485508))
- fixed native props not being passed to core components ([efa2de0c7d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/efa2de0c7d6850c77d568482e31aa850fd03977b))
- fixed KeyboardAvoidingView for `null` children ([5241ffbb8a](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/5241ffbb8a81b2c3ab8fd7c903f6bec51e0dee2d))
- changed hvigor-plugin to use `DEVECO_SDK_HOME` environment variable instead of expecting `hdc` to be in the path when configuring phone for Metro ([8c9d571a85](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/8c9d571a850d4d178f65cbe4a571d0b30e82830e))
- changed scripts used by git hooks in the tester to find clang-format in $DEVECO_SDK_HOME ([14b3841203](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/14b38412039e1702f33456e7250e998a1536b1cf))
- removed code that sets a default transformOrigin from ArkUInode ([25c1b104ce](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/25c1b104ceb22a693ad22c34b7cd02022bae55a0))
- removed `folly` source submodule from the project repository ([3e26e328c8](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3e26e328c83e979f682b3951eeb65c749bde5167))
- removed `libfmt`, `double-conversion`, `libboost`, `glog`, `hermes` and `libevent` source submodules/directories from the project repository ([db4e1121a6](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/db4e1121a6fcdacd7a25fbc0f838dcb6eabc02e7))
- removed deprecated ArkTS software elements: `Descriptor::isDynamicBinder` property, `DescriptorRegistry::getDescriptorByTagMap`, and `BorderMetrics` type (ArkTS) ([b7ac8577fc](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b7ac8577fce08527db84220d0eebe60ac08a07f4))
- bumped @rnoh/react-native-harmony-cli to 0.75.4 ([4f955982c2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/4f955982c2231958246075bfeafeef044405a7fb))
- disables DevMenu when building in release mode ([1401530450](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/14015304504f4d065426c355a18f134a84f57fe9))
- optimized bundle loading for files and rawfiles by using `mmap` instead of reading the bundle contents to a buffer ([a65956cc23](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a65956cc23e73d1659cbe1573011887ce8fb3fb2))
- get `ArkUINode` from `NODE_BY_HANDLE` instead of userData. ([ef75f23b47](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/ef75f23b474b3eece32d16873ac5919e99098dcc))
- download `folly` dependency during CMake config ([3e26e328c8](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3e26e328c83e979f682b3951eeb65c749bde5167))
- sync `folly` version to that used by RN Android 0.75.4 ([3e26e328c8](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3e26e328c83e979f682b3951eeb65c749bde5167))
- download `libfmt`, `double-conversion`, `libboost`, `glog`, `hermes` (source) and `libevent` dependencies during CMake config ([db4e1121a6](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/db4e1121a6fcdacd7a25fbc0f838dcb6eabc02e7))
- sync `libfmt`, `double-conversion`, `glog` and `libevent` versions to those used by Android 0.75.4 ([db4e1121a6](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/db4e1121a6fcdacd7a25fbc0f838dcb6eabc02e7))
- set `ARKUI_ACCESSIBILITY_MODE_ENABLED` if text isn't in component with `AccessibilityGroup` set to true ([45932c80a6](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/45932c80a6a443f023b3acd93e7ce0c061506494))
- optimized rendering pipeline (10-15ms/1500 views) ([437ddc250d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/437ddc250d614e83d615e6fd182b15a0b5f6216a))


## v0.75.2
- [breaking] disable autolinking of libraries by default; enable only for libraries that explicitly support autolinking (CLI: link-harmony) ([cdb02f5b9b](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/cdb02f5b9b414c4a1d32327f8f0d8848bd98cc52))
- [breaking] renamed HarmonyReactMarker to RNOHMarker ([eabcfa775b](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/eabcfa775b0c8693cb2294bec66745f8cc6f5c00))
- deprecated ArkUINode::setAccessibilityLevel ([33f7d39098](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/33f7d39098bfd9c198635d9673986c26de0ef91c))
- deprecated `RNApp::wrappedCustomRNComponentBuilder` property ([da736db8c1](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/da736db8c137e62fabcc13d8e01115cb72a82030))
- added `RNOHMarker` class to simplify listening to React Marker events in ArkTS ([6dc552093d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6dc552093d954c90272c6d174401dac9425a1f70))
- added support for `UIManagerMountHook`s ([c81afac77e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/c81afac77e4aef0c0674a586a12eee889a3367cb))
- added `react-native run-harmony` command ([a949e41538](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a949e41538199decdea38899210a2789c9737905))
- added `getInitialBundleUrl` in `AnyThreadRNInstance` ([9067901709](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9067901709c47b3156fff2c6d33c4396e6baf061))
- added support for React Native bridgeless mode ([da736db8c1](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/da736db8c137e62fabcc13d8e01115cb72a82030))
- fixed text not being clipping by default ([9038018d55](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9038018d5559813446e90df02de8ca9d8749b70b))
- fixed behavior of the accessible prop  ([33f7d39098](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/33f7d39098bfd9c198635d9673986c26de0ef91c))
- fixed incorrect keyboard behavior in modals ([78e86bee77](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/78e86bee779f27b2d477aec9b8bf12759615d23e))
- fixed Metro config on Windows ([37f37074f2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/37f37074f2ca8a4b26649accf02f993e32be13bc))
- fixed deadlocks caused by reentrant mounting transaction ([caf6320d27](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/caf6320d279fe6e441a2abf9b4b9796d2b954687))
- fixed `setInterval` callback triggering multiple times when restoring the app from background ([1449bc6a95](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/1449bc6a95972f025bfe7de1b6d58b0cd662569d))
- fixed `fetch` for local assets when `FileJSBundleProvider` was used to load a bundle ([9067901709](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9067901709c47b3156fff2c6d33c4396e6baf061))


## v0.75.1
- added support for @2x @3x image suffixes ([7a26d1dc7e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/7a26d1dc7ebc3fef76e5447224546e36a0907073))
- added shake to open dev menu feature ([eba4c3d728](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/eba4c3d728cde8a460d73e555930de40d3a817bc))
- added possibility to pass touches through RNSurface to its siblings when no RN touch target is found ([3ce303c40d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3ce303c40d23847e04aadbc1f1497d386c013e4f))
- added support for `facebook::react::SystraceSection` ([37cc8ca57e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/37cc8ca57efb692529b156a0ea3e25c9005debbe))
- added `NoArkUINodeError` for representing Components with no native nodes ([4b8397b0bb](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/4b8397b0bb9f34ffa0d9da0d96698062bc4ca124), [512bf12ae2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/512bf12ae2bc1c19bd793eb973231ce780052814))
- added automatic Metro reconnecting support ([689f76a81d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/689f76a81d7b20badad3b495af2a17fcf9580fa4))
- optimized power consumption by ~4% of the power used by a screen by not requesting VSync frames if it's not necessary ([42f054b88f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/42f054b88f13e55a241be4024a5cb2956bcbb2f7))
- fixed `style::transform` issue introduced when updating RN to 0.75.4 ([99a35016c3](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/99a35016c340d8e4f1f24ca7717191294dfd3ea1))
- fixed unexpected text overflowing ([d6d70530b3](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/d6d70530b3f44cefc85e92be6444c089aac593cb))
- fixed breaking change introduced in SurfaceContext in v0.72.40 ([89c0d254bb](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/89c0d254bb624a3a5950663d7b8a61ff7f15bcb1))
- fixed cleanup of callbacks passed to ArkTS runtime ([2ab4b6e606](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/2ab4b6e6064ecc6a2fb69b5cd5193e15d1639b37))
- fixed not applying selection when focused for the first time ([6e9b078647](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6e9b0786479eac8a29626f7b418669102f7cb1ab))
- fixed compilation error related to DLOG(INFO) in ~ShadowViewRegistry when compiling in the release mode ([c85ec42e70](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/c85ec42e70789e372aa4cd54e06ee32a058429f4))
- fixed wrong alignment of `ScrollView` when it's larger than its content ([f703eb09dd](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f703eb09dd4d385b6dfa9fae8db485b966afc18b))
- fixed `ScrollView` with `refreshControl` not moving down when pulled ([637165669b](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/637165669b0f097d53876b7e56b075b9bab20e58))
- fixed `tsconfig.json` ([65c6dc0e16](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/65c6dc0e16104e1469b70d482409646ec95739ea))
- fixed internal redirects for aliases with scoped package name on Windows ([febf0e97b9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/febf0e97b935717066649f9ff675dee1b00e089c))
- removed deprecated `ComponentBuilderContext::descriptor`, `ComponentBuilderContext::rnohContext`, `DescriptorEssence` type ([10d72501dd](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/10d72501dd817834a4dba4fb8b2ef81b303dffc9))
- removed deprecated `HttpClientProvider` and `RNInstancesCoordinatorOptions::httpClientProvider` ([ccadd1fc13](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/ccadd1fc1399bc31c010d39ecab5833dc9d1736f))


## v0.75.0
- [breaking] updated peer dependency to react-native to 0.75.4 and other NPM dependencies related to react-native — app projects may need to update their configuration files (package.json, babel.config.js, metro.config.js, .eslintrc, and tsconfig.json) to be in sync with RN (use https://react-native-community.github.io/upgrade-helper/ to update platform-agnostic files in your React Native project): (react: 18.3.1; react-native: 0.75.4; @react-native/eslint-config: 0.75.4; @react-native/metro-config: 0.75.4; @react-native/typescript-config: 0.75.4; @types/react: ^18.2.6; babel-jest: ^29.6.3) ([6068348723](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6068348723e2c4d7a274b5c02bdac6a7851a1c34))
- [breaking] changed props->yogaStyle in ComponentInstances (C++) ([6068348723](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6068348723e2c4d7a274b5c02bdac6a7851a1c34))
- deprecated `ArkUINode::setAccessibilityState(const facebook::react::AccessibilityState& state)` in favor of `ArkUINode& setAccessibilityState(const std::optional<facebook::react::AccessibilityState>& state)` ([6068348723](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6068348723e2c4d7a274b5c02bdac6a7851a1c34))
- added codegen support for object props ([6068348723](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6068348723e2c4d7a274b5c02bdac6a7851a1c34))


## v0.72.41
- added `EtsUITurboModule` which provides ets-only TurboModule APIs by using `EtsUITurboModuleContext` ([12ba9a8d9f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/12ba9a8d9fa58805603b3dc173c2f3ac68eb8588))
- added `EtsUITurboModuleContext.runOnWorkerThread` to allow scheduling tasks on the worker thread from `EtsUITurboModule`s ([12ba9a8d9f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/12ba9a8d9fa58805603b3dc173c2f3ac68eb8588))
- added `RNComponentContext.runOnWorkerThread` to allow scheduling tasks on the worker thread from custom ArkTS components ([12ba9a8d9f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/12ba9a8d9fa58805603b3dc173c2f3ac68eb8588))
- fixed crash when shadowColor was used in ArkTS component ([086971ca73](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/086971ca733fc27b37d93602a41821cc467d580d))
- fixed possible deadlock when calling TurboModuleProvider::getTurboModule ([9d329d2973](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9d329d2973af36b472c982838d8351c85641c88d))
- fixed crashes in TimingTurboModule ([79db3615f9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/79db3615f9334d1cc9e9b342ee32303b94a5c245))
- fixed crashes due to unsynchronized access to TurboModule cache ([41a1551d82](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/41a1551d82b90244d11f9023bcaa7312e9af2da0))
- fixed crashes when an ArkTSTurboModule is registered on ArkTS side, but not on CPP side ([41a1551d82](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/41a1551d82b90244d11f9023bcaa7312e9af2da0))
- fixed incorrect thread assertion inside `TimingTurboModule` destructor ([d4d47e2cce](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/d4d47e2ccee94959c5250ab0317ff59eb1188965))
- fixed ScrollView with refresh control ([4085845307](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/4085845307922a1ad47cb8826cbb18d8ae0d05e7))
- fixed `accessible` View property not applying correctly ([7994e7f977](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/7994e7f97797b2f923128f5b4cd4057128921dc2))
- removed deprecated `resolveBorderEdgeProps` (ets) ([bd25c10ad2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/bd25c10ad22f4b7da98ded195f0247b87e6f8a84))
- removed deprecated `resolveBorderMetrics` (ets) ([bd25c10ad2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/bd25c10ad22f4b7da98ded195f0247b87e6f8a84))
- removed deprecated `resolveBorderRadius` (ets) ([bd25c10ad2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/bd25c10ad22f4b7da98ded195f0247b87e6f8a84))
- removed deprecated `resolveBorderEdges` (ets) ([bd25c10ad2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/bd25c10ad22f4b7da98ded195f0247b87e6f8a84))
- removed deprecated `RNInstance::commandDispatcher` (ets) ([bd25c10ad2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/bd25c10ad22f4b7da98ded195f0247b87e6f8a84))
- removed deprecated `RNApp::buildCustomComponent` (ets) ([bd25c10ad2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/bd25c10ad22f4b7da98ded195f0247b87e6f8a84))
- undeprecated `convertColorValueToRGBA` (ets) — there are use cases where this method must be used because Color class cannot ([bd25c10ad2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/bd25c10ad22f4b7da98ded195f0247b87e6f8a84))
- redeprecated (delayed removal) `ComponentInstanceRegistry::registerComponentManager` ([bd25c10ad2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/bd25c10ad22f4b7da98ded195f0247b87e6f8a84))
- redeprecated (delayed removal) `RNComponentFactory` and changed this component to be NOOP ([bd25c10ad2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/bd25c10ad22f4b7da98ded195f0247b87e6f8a84))
- redeprecated (delayed removal) `RNViewManager::updateBoundingBox` ([bd25c10ad2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/bd25c10ad22f4b7da98ded195f0247b87e6f8a84))


## v0.72.40
- [breaking] removed TouchDispatcher and TouchTargetHelper (those classes were used internally in ArkTS architecture, it's unlikely libraries or project used them) ([bcf1490d2f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/bcf1490d2f6360639d4f8e8694559a46f6d57c6e))
- [breaking] changed `m_deps->componentInstanceRegistry` from shared to weak pointer ([9a835de206](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9a835de2068ce0e095fa1200770c45988bdcbced))
- [breaking] removed outdated CLI commands: pack-harmony, unpack-harmony, create-metro-host-constants ([8861ee5682](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/8861ee5682841c5f1801f1a9413a879c7276ba8f))
- [breaking] removed ArkTS architecture support (it didn't work for some time anyway) ([a465880a52](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a465880a529d1887507382d1110f9bb67d2c9950))
- [breaking] removed classes related to ArkTS architecture ([a465880a52](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a465880a529d1887507382d1110f9bb67d2c9950))
- [breaking] removed deprecated ArkUINodeRegistry ([7f487044c7](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/7f487044c7a53717f9dea587ee24513ece5a1007))
- [breaking] changed StandardRNOHLogger to not trigger RedBox on error messages ([389bc7acd7](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/389bc7acd799e8b6abad5d4d5855d05b5f343ff0))
- deprecated SurfaceConfig1 and SurfaceConfig2 types ([b12217056e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b12217056ebb30941720167706ef1519de045e96))
- added autolinking support (`link-harmony` command + updated hvigor plugin) ([0888ccff31](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/0888ccff31a7058363ccb604609cb3ee3aae7c94))
- added @Require decorator to the required properties of RNOH ArkUI components ([cc800bcd9e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/cc800bcd9e9ff6833a12d9f339b0bfce085e1fdf))
- added document listing supported RN API ([e4210fc5c8](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/e4210fc5c847ed2ad8bcb432d3cda1c10b2191d5))
- added RNOHErrorEventEmitter, RNInstanceError, and refined error handling ([389bc7acd7](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/389bc7acd799e8b6abad5d4d5855d05b5f343ff0))
- added support for multiple sources of remote images ([77b9b9c4de](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/77b9b9c4de65227f54f69b0e2da9fdfd39c1dab3))
- added support for mounting React children in ArkTS components through `ContentSlot` API ([ac195946e4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/ac195946e4333de7443675c9a4a96f2e342f1798))
- added a support for registering fonts loaded from sandbox filesystem with OHOS to allow using them in non-`Text` components ([927cac47a0](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/927cac47a04ede03f79a47f7176d27b02b8d96ec))
- fixed defaultBackPressHandler not being triggered when it should be ([47e195a860](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/47e195a8606eba548796f9c7ed176b522f924556))
- fixed issue with mutations to ArkTS components not applying correctly ([27457f4cde](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/27457f4cdedfee4fa5a039533d655776628d2164))
- fixed passing multiple values for one argument for `cli` commands ([3ff65b0263](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3ff65b026306ae008867c86ad044086330433b96))
- fixed triggering JS timers so that in happens only once per frame ([8bab695031](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/8bab6950313c100775d8b8c1086fc756db768815))
- fixed a memory leak that occurred when deallocating ArkUINodes, which can have children ([9a835de206](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9a835de2068ce0e095fa1200770c45988bdcbced))
- fixed a memory leak caused by not deallocating the ComponentInstanceRegistry and its content when removing an RNInstance ([9a835de206](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9a835de2068ce0e095fa1200770c45988bdcbced))
- fixed a crash when creating a `TextInput` with `autofocus` property set ([3f2e20fe20](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3f2e20fe20de1d462c133e297d9fe5ef9f34c1d4))
- fixed TextInput triggering both typing key and backspace ([0868320a59](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/0868320a5936d1912bc279d659e9057b4b6ac2d5))
- changed RNSurface::surfaceConfig type in order to remove the need of casting the config type from RN App developers ([b12217056e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b12217056ebb30941720167706ef1519de045e96))
- changed ImageLoaderTurboModule to run on UI thread to avoid task scheduling overhead when updating `ImageComponentInstance`s ([2871b8d0b4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/2871b8d0b42b2f0de0010fbd82230acfc346894f))
- changed preallocation logic to set all `ShadowView` attributes, not just `props` ([f457363cb8](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f457363cb87c07ac78761c627f08d1d67b5198bd))
- removed (internal) ParagraphMeasurer module ([3b0e9c8509](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3b0e9c850990cfe6488150eb3a0ea55fbcd426ef))
- removed workaround of wrapping Custom ArkTS components in `RootComponentInstance`s ([1603f6bd1e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/1603f6bd1e8c065554da5b45c446bffd68c63a97))
- optimized triggering JS timers that finish at a similar time together, reducing the number of JSI calls ([8bab695031](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/8bab6950313c100775d8b8c1086fc756db768815))
- updated precompiled libhermes.so with the latest OHOS toolchain ([6d675683a9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6d675683a96803825e1759e139883423873b9445))
- moved Fabric transaction processing to the MAIN thread ([13036b3c8a](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/13036b3c8abd4847cb6666f54c776c95502c08e5))


## v0.72.39
- deprecated RNPackage (ts) class in favor of RNOHPackage (ets) — RNPackage becomes internal ([4d532834b7](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/4d532834b7d5d187b9044cfe91b419a745ccf3d6))
- added RNOH Hvigor Plugin, which triggers code generation on project synchronization ([59be79de4d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/59be79de4dc99577b0e543747e6d969fd2dec5c9))
- added `AnyThreadTurboModule` class to allow writing TurboModules which can run on either UI or Worker threads ([d613657731](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/d613657731ab3bb2cfb69ff06bd59ce238fe308c))
- added support for registering fonts from the application sandbox filesystem ([d700228cd2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/d700228cd2cbfd87432578e06284af007ce6c3a4))
- added `RNSurface::constraints` and ability of adjusting dimensions of `RNSurface` to its content ([0f9863370a](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/0f9863370a72f818fd8e7cd5c2f2dd38701ad32b))
- added support for loading images from sandbox when using FileJSBundle ([6e08d79ccc](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6e08d79ccc7b1a169358c0e7a1080f7a99f1e5e3))
- added logs for errors caused by lack of permisssions ([367d4b7180](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/367d4b718091516532983a5d43631d4acd1ba5b2))
- added `WITH_HITRACE_REACT_MARKER` definition which allows to disable logging React Markers ([8131272101](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/813127210172855236685023485f6e396cebe385))
- added basic support for `View::accessibilityLabelledBy` ([f662cf6dd0](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f662cf6dd0b9518e26af46ee011944311685f3e7))
- added `ComponentInstance::Registry` interface to `ComponentInstance::m_deps` ([f662cf6dd0](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f662cf6dd0b9518e26af46ee011944311685f3e7))
- added `RNInstance.registerFont` method for dynamic font registration ([f6a797c7d4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f6a797c7d43d4bad8a0151c5393588609282d10a))
- added AccessibilityInfo::isBoldTextEnabled support ([0bb7ef49ea](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/0bb7ef49eab600606718839dc26363e7dbec2333))
- added View::onAccessibilityAction and View::accessibilityActions support ([6a3ee952b8](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6a3ee952b8a1ff38f2fbfdbacba7a850768f15c6))
- added View::accessibilityState{disabled, selected, checked} + View:{aria-disabled, aria-checked} support ([18ee4202ff](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/18ee4202ff67088d93bc1072265ba1521afc847d))
- added View::role and View::accessibilityRole support ([cacaf2ac42](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/cacaf2ac42545d132aa93fc4476571bbfd2e3f7c))
- added getMetadata to ArkTSBridge ([b205473f65](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b205473f6574aa8f9393dd8b9595a9de51661103))
- added AccessibilityInfo::setAccessibilityFocus support ([4028406659](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/402840665967512860a6a1c5718922b547b32e43))
- added `AccessibilityInfo::sendAccessibilityEvent::focus` support ([5f177c2476](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/5f177c247603861752167f74f4b56821f79c8715))
- added `AccessibilityInfo::announceForAccessibility` support ([b815acdb58](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b815acdb58e2a4de7fa42241be2a3887a9e94241))
- added support for `AccessibilityInfo::isScreenReaderEnabled` and `AccessibilityInfo::addEventListener::screenReaderChanged` ([cc9830a7b9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/cc9830a7b9701ce54aba7b42769757ea61d9e04d))
- added halfLeading support ([b205473f65](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b205473f6574aa8f9393dd8b9595a9de51661103))
- maybe added `AccessibilityInfo::sendAccessibilityEvent::{click, viewHoverEnter}` support ([5f177c2476](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/5f177c247603861752167f74f4b56821f79c8715))
- fixed `onLoad*` callbacks not triggering in certain cases for the Image component ([8b9a9c8cbe](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/8b9a9c8cbe98c9b4af0f70bc2d62388202c99366))
- fixed crashes due to use-after-free of `ArkTSChannel` when destroying an `RNInstance` ([9dd6ee1516](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9dd6ee1516d812b3db179eec4acfacafecbee27a))
- fixed incorrect cursor placement when setting content via state ([40ee441745](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/40ee4417454174017492bd5eded7b249d8f4cc0d))
- fixed incorrect CMake configuration preventing linking C libraries with `librnoh` ([cf3cf9eeff](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/cf3cf9eeff6f6250fc9b09dedae3934708c77ff9))
- fixed ScrollInternalState stuck in wrong state ([d91e366ea7](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/d91e366ea74b137d2b33344ea68c275fb8fa3064))
- fixed logs with multiple arguments not working properly ([367d4b7180](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/367d4b718091516532983a5d43631d4acd1ba5b2))
- fixed `overScrollMode` value resets after orientation change ([31131d892e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/31131d892e361216d99df0a703b2617c6f5f33d8))
- fixed `WITH_HITRACE_SYSTRACE` definition behavior ([8131272101](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/813127210172855236685023485f6e396cebe385))
- fixed CHANGE_THREAD_PRIORITY React Marker not appearing in the trace file ([cc36e991ec](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/cc36e991ec976c21b292c841590630dab00f7c37))
- fixed: incorrect `ScrollView` content offset returned when RTL is enabled ([5b673360ac](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/5b673360ac8bd45057629e9941309d823c74c11a))
- fixed: `stopSurface` never resolves its promise, breaking Surface / RNInstance cleanup ([fb0cc6f3fb](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/fb0cc6f3fb1e47482c04a0ba8293c908dfb06c1d))
- fixed TextInput native event count being incremented incorrectly ([87437c7d28](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/87437c7d285798ce45c10b3cafa973d851e76323))
- fixed never ending React Markers in a trace files ([bce30aa5c1](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/bce30aa5c168174ecac605dca3cd98cd07588d63))
- fixed remote images disk cache ([3a888acb7b](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3a888acb7b268da740c04fc01ce65056a8590c42))
- fixed crash caused by using undefined this.surfaceHandle in RNSurface::aboutToDisappear ([8162155868](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/81621558681579c89dde3146e7753531d8cfaf7a))
- maybe fixed "Cannot read property props of undefined" ([f82c1ae941](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f82c1ae941fbbe7b2feca10ea7f2bd1788762a15))
- changed `RNAbility.getRNOHWorkerScriptUrl()` to be optional, with `WorkerThread` not running unless configured ([28641fc3e8](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/28641fc3e88f999e235fbe2273887d5251a8daa3))
- changed DLOG(ERROR) to LOG(ERROR) ([abee8bfc81](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/abee8bfc815c359a9212ad917ffdadb214850851))
- changed `ScrollNode` `onScroll` delegate callback to respond to native `ON_DID_SCROLL` event (instead of `ON_SCROLL`) ([2199c8ed99](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/2199c8ed995f0c1f510ed7f47c05a5eabe6b795b))
- optimized performance by changing changed VLOG(1) to DLOG(INFO) ([abee8bfc81](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/abee8bfc815c359a9212ad917ffdadb214850851))
- optimized removeClippedSubviews feature ([734fd6d5af](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/734fd6d5af03a4d574df9e122993558ea5a3065a))
- optimized SchedulerDelegate operations latency when called from MAIN thread ([dea2d6f980](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/dea2d6f98058f34b3c8b1b114385474807188996))
- removed ENABLE_RN_INSTANCE_CLEAN_UP flag ([750eadea5f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/750eadea5ff9006bdce81e332236cca5b109c757))
- removed `TextMeasureRegistry` instead storing the ArkUI `StyledString`s and OHOS `Typography` objects in `HostTextStorage` in `Paragraph`'s `state` ([fbd4b89869](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/fbd4b89869bab142cc4bff868417e095652d2cec))

## v0.72.38
- [breaking] changed SafeAreaView to include bottom inset by default (previous behavior can be restored by specifying `paddingBottom: 0`) ([7071e43300](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/7071e43300546daaa39b23180c6ee52e920bfbba))
- updated @rnoh/react-native-harmony-cli to version 0.0.27 — this version adds a new command `codegen-lib-harmony` ([03524e7ab9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/03524e7ab9fe6d78444f9ca36c96a51af5398ef9))
- added support for font variants ([1857b57d4c](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/1857b57d4cce1bc3c9217402095caea49d2664a3))
- added TextMeasureRegistry to cache text measurements ([6023919e4e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6023919e4e5fd6827a6089c6a93b29540c437f13))
- fixed a deadlock occurring when the surface is being stopped and setNativeProps is used at the same time ([a4af7034ec](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a4af7034ec715282ad30d458a506f7d0ac463336))
- fixed not failing Image.getSize('') ([95f464ac7c](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/95f464ac7c535aaae66f0c06a9f0376c06c53172))
- fixed scroll aligning to the end when contentSize smaller than containerSize ([71e5624b9f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/71e5624b9ff1919890dd9b0650e8774e7826fdc7))
- fixed SafeAreaView insets when SafeAreaViews are nested ([c7fd583168](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/c7fd58316869ab0d8232186f6c7285cfc66de502)) ([7071e43300](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/7071e43300546daaa39b23180c6ee52e920bfbba))
- fixed memory leak in View preallocation ([580d06fbc5](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/580d06fbc5796af176a3ec07b0c95efa2eca5624))
- fixed overscrolling behavior when removeClippedSubviews is enabled ([c0ca29e55d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/c0ca29e55db9c543741bd59d4475344c4d5d4e5b))
- fixed removeClippedSubviews when scroll direction changes to horizontal ([1923572377](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/192357237711034d44fc186fe80532c304fa7401))


## v0.72.37
- [breaking] replaced workerRNInstanceConfigByRNInstanceName with createWorkerRNInstanceConfig to support creating configs dynamically ([e4885b2041](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/e4885b2041e0cc9840b83756e77d7276230f88c9))
- [breaking] optimized creating napi values from dynamics by changing the signature of `ArkJS::createFromDynamics` to take the vector of dynamics by const reference ([96d7cef977](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/96d7cef9779391b9618930790bbfd8760a3ea2be))
- added string interpolation for native animations ([73610a29eb](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/73610a29eb8020ba7b040af5db8e0da07d574618))
- fixed disabling removeClippedSubviews ([860adaf0cc](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/860adaf0cc2f44e919de830a805b6f3c6573707e))
- fixed sticky headers when screen is rotated or folding screen is expanded/collapsed ([ef3be2da79](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/ef3be2da794eb08b0467b1d5ddf1630fc43d8f95))
- optimized removeClippedSubviews performance by removing redundant RemoveClipped calls ([73f7978b8d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/73f7978b8d5995e4e59c38ec5735f86c03282350))
- optimized text measuring ([f0e01edede](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f0e01edede74c4e24d2ff0780e82a9d44017ad3c))
- maybe fixed EventTarget destruction crash ([c2f00e8781](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/c2f00e878120cf3b1f1fd2cc5859dfdc9e66dee1))
- maybe fixed nullptr dereference crash originating from `RNInstanceInternal::onUITick` ([971dab6676](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/971dab6676e335cff0e2c8d0a0803a64981aa973))
- improved responsiveness by dispatching certain events as soon as possible instead of waiting for the next vsync ([00deaad18a](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/00deaad18afbf003ace617b37130702cd5ff1362))


## v0.72.36
- added Text::dataDetectorType (email, phoneNumber, etc.) feature ([67035f4e5d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/67035f4e5d3979dd512e8ec244c0a931564c372e))
- added support for adding custom listeners in HarmonyReactMarker ([93833d25c1](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/93833d25c1358f25411c2b8f7f52cceec1246760))
- fixed possible deadlock when destroying a RNInstance ([3fe266423a](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3fe266423a2135dbe75f446556c0acc417b307dd))
- fixed a deadlock when an ArkTSTurboModule waiting on the ArkTS thread is dropped ([766d7922c9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/766d7922c98735ceee85c0dcbbd8754264ca308c))
- fixed occasional crashes due to JS callbacks being freed on a wrong thread ([dea1d9dd31](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/dea1d9dd316482ed3d2ed5def98b661c72fbd79c))
- fixed not cleaning WorkerRNInstance environment ([c92d8555b4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/c92d8555b44f5b5b1df8c35fabfc11a7b2ef83fe))
- fixed crashes when cleaning up TurboModules with pending promises ([b318477e0e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b318477e0e2cc3d922bea91646ca67fa26ecb071))
- maybe fixed potential deadlock when creating a `ThreadTaskRunner` ([3a623fbc62](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3a623fbc626ebe3342c30f9b123743b1ec320c47))
- maybe fixed potential deadlocks when scheduling sync tasks caused by incorrect use of condition variables ([a489a3f395](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a489a3f3953f793edcb5b42980981d8581ccd173))
- optimized rendering components nested in the `Text` component ([4db5657c65](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/4db5657c65a383e75466eeec7db8e633e01959ca))
- optimized ScrollView::removeClippedSubviews ([e6b90968b3](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/e6b90968b3d3f7aa792465fea39947fa2ec12d39))
- reduced the delay when scheduling delayed task on current thread ([21d45fbc5f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/21d45fbc5f2f5018887d2ed71d6c8a8b7f0f4434))


## v0.72.35
- added assertions for Napi reference use ([f7bddd2b14](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f7bddd2b149d3f1536c8ec1808fbdc45dcd225be))
- added `WorkerRNInstanceConfig::httpClient` ([c93b50f494](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/c93b50f494f1d2d17e9df4d85c394856a7c64c06))
- added warning logs for sync TM calls that take long time to execute ([a35101f875](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a35101f875eb55ce91ae9eb14fd5a4ea35c455cd))
- fixed a possible deadlock during `RNInstance` initialization ([e90806a7da](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/e90806a7da42b8bdf6e6924b46b3cb9e3ef0baba))
- fixed reporting errors emitted from C++ side (sometimes errors weren't displayed in the ErrorBox and not logged properly) ([80fab398e1](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/80fab398e119fc0b0a92cf31b7d2144af6422288))
- fixed issue with mutlitouch scenarios cancelling touches ([96db756646](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/96db756646e7371cc72be9c3069c289172032c72))
- fixed `VirtualizedList::onEndReached` not being called after calling `ref.scrollToEnd()` ([b558534d62](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/b558534d62204085c147a474121b0c6d2a8a2775))
- fixed `transform` not being set correctly on first render ([eb8040bf06](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/eb8040bf068a02f8853c07d380c9ee6c53d02e17))
- fixed insert/remove mutations not being passed to ArkTS components in C-API architecture ([f30acafebb](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f30acafebbc3418d0390378999497d448f6a4bbd))
- changed `TaskExecutor::Task` to only require the passed object to be moveable, not copyable ([4e22bff9e9](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/4e22bff9e9c1efe4d78052b5555385887a78a4f8))
- optimized number of ScrollView state updates ([9ef1005983](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/9ef10059838ac42323f06d8c4e113e1904e7db4f))
- optimized JS runtime responsiveness by moving SafeAreaTM and StatusBarTM to the worker thread ([80fab398e1](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/80fab398e119fc0b0a92cf31b7d2144af6422288))
- optimized main thread utilization by moving Networking, WebSocket, Blob and FileReader Turbo Modules to the worker thread ([c93b50f494](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/c93b50f494f1d2d17e9df4d85c394856a7c64c06))
- optimized async Turbo Module calls by removing unnecessary synchronization and calls to TaskExecutor ([af66e80497](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/af66e80497535e3747c61d1f42d00fc9f3eda5d1))


## v0.72.34
- [breaking] changed setupRNOHWorker params ([32e1cfabf4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/32e1cfabf40ffdba67f53b418b68df977fe2f44d))
- [breaking] made RNInstanceOptions::name required ([32e1cfabf4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/32e1cfabf40ffdba67f53b418b68df977fe2f44d))
- [breaking] made `RNAbility::getRNOHWorkerScriptUrl` abstract — RNOHWorker is now required because some core Turbo Modules are going to be moved to the Worker thread ([a8d200324d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/a8d200324d59a58cb79d300f95d0a0c3e52ae716))
- [breaking] changed the type of `ArkTSTurboModule::Context::arkTSTurboModuleInstanceRef` ([f286a844e0](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f286a844e00f55d2d63de1d546113bee8ba97f4f))
- [breaking] changed RNOHCoreContext::destroyAndUnregisterRNInstance to be async ([2d123b4cc5](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/2d123b4cc59ea0647a4cb60e1bbd72c69d28647f))
- [breaking] removed enableNDKTextMeasuring feature flag ([efe644bd9d](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/efe644bd9dbe242257c00db78bb9fcb737fa0803))
- deprecated RNInstance::getTurboModule in favor of RNInstance::getUITurboModule ([32e1cfabf4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/32e1cfabf40ffdba67f53b418b68df977fe2f44d))
- added WorkerRNInstance::getWorkerTurboModule ([32e1cfabf4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/32e1cfabf40ffdba67f53b418b68df977fe2f44d))
- added support for writing directions ([00b1ae1067](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/00b1ae106795ee1a18b983021913c51ba74bde67))
- added WorkerRNInstance::postMessage ([18ec98e46a](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/18ec98e46ab82d8d949bde01577fb3dce1a2c252))
- added WorkerRNInstance::getArchitecture ([18ec98e46a](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/18ec98e46ab82d8d949bde01577fb3dce1a2c252))
- added decorationType ([5f34b7203c](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/5f34b7203cc21a54f1b63e7a558675387d8cb0ef))
- added lengthMetricUnit ([5f34b7203c](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/5f34b7203cc21a54f1b63e7a558675387d8cb0ef))
- added selectedBackgroundColor ([5f34b7203c](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/5f34b7203cc21a54f1b63e7a558675387d8cb0ef))
- fixed a bug where worker TurboModules were created on a wrong thread ([5302f38e35](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/5302f38e3532c61c5bab66a8c9a2b420a1c656bf))
- fixed incorrect prefix used by WorkerTurboModuleContext::logger ([18ec98e46a](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/18ec98e46ab82d8d949bde01577fb3dce1a2c252))
- fixed WorkerTurboModule::__onDestroy__ not being called ([2d123b4cc5](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/2d123b4cc59ea0647a4cb60e1bbd72c69d28647f))
- fixed not working lint:js:fix script ([f2396f5f72](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f2396f5f72c334b3f53342cf13ed4a5c7d0fd8fa))
- changed default textBreakStrategy to Balanced ([1c58d37759](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/1c58d37759e69ebf463fc0c067f1b6a1bb0e5fcd))
- rearranged ArkJS::createFromDynamic branches by frequency decreasing order ([90357cd6a2](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/90357cd6a26b1c4edf591a6a55d1eb55c68a1dcd))
- optimized main thread usage by moving AppearanceTM on the worker thread ([d98c568f97](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/d98c568f976d98766bb2129dd165d77b531b200c))
- optimized image prefetching by moving ImageLoaderTurboModule on the worker thread ([874d3e719f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/874d3e719fb32a4cae38b5654f1dde7725f06c6d))
- early return in onScrollFrameBegin function for scroll components with scrollEnabled false ([0d24b2f01e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/0d24b2f01ede99fe5679acf6321ff82a2af22406))


## v0.72.33
- [breaking] changed `setupRNOHWorker.ts` to `setupRNOHWorker.ets` — `setupRNOHWorker` can't be imported from TypeScript files anymore ([f211e048ca](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f211e048ca29f1f76ecbe0dd1d56948203c33248))
- [breaking] changed compatibleSdkVersion to 5.0.0(12) ([23a0506e75](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/23a0506e75a21b558eca408cb4b6a810e8c8dedc))
- added Surface class and RNInstance::getSurfaceByRootTag ([4fa36118c7](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/4fa36118c789f9d793314b8b72a0c0126957ad25))
- added (Worker)RNInstance and UIAbilityContext to WorkerTurboModuleContext ([6226da81fc](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6226da81fc5ebca3fd96e6d2dd047261bbbbed44))
- added `EtsWorkerTurboModule` and `EtsWorkerTurboModuleContext` — this context provides a function `runOnUIThread` which allows WorkerTurboModules to run tasks on UI thread and access `UITurboModuleContext` ([f211e048ca](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f211e048ca29f1f76ecbe0dd1d56948203c33248))
- added sendable `UITaskRunnable` — use this class to implement tasks that should run on the UI thread from WorkerTurboModules ([f211e048ca](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f211e048ca29f1f76ecbe0dd1d56948203c33248))
- added RNOH errors handling thrown on the worker thread ([f211e048ca](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/f211e048ca29f1f76ecbe0dd1d56948203c33248))
- added @api markers to software elements in the `RNOH/arkui` directory (added @internal marker to ImageSpanNode, TextInputNodeBase, TouchPoint, XComponentSurfaces) ([6ba9dd0124](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/6ba9dd01240428fd2844b544669fe80668eb27eb))
- added CustomNode ([190703cde4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/190703cde42612e3fe62b16ff28262f118e1c6ce))
- added ArkUINode::setLayoutRect ([190703cde4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/190703cde42612e3fe62b16ff28262f118e1c6ce))
- fixed ScrollView offset resetting when navigating to a different page ([3465c258a7](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3465c258a7d025005ff4c6d0cf138269eb00b3af))
- fixed thread names not being set correctly ([23e923e029](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/23e923e0295971d581b497284d5a06cbdc754ca6))
- fixed crash when an Instance with running Surfaces is destroyed ([45e360bd19](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/45e360bd198f3ed6397b2b642748b5338d2a1278))
- fixed crashes when timers trigger during Instance destruction ([0babd5c77f](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/0babd5c77f9d3795bd21eabc6a3fbaa6f6bc26ed))
- fixed text measurements for custom fonts ([4c22864ce8](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/4c22864ce8ba128be41374f68136cd5649ac8f9f))
- optimized task scheduling on JS thread for better responsiveness ([1287256cd4](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/1287256cd42c2b7ef2d439ba6d4991bf1d539170))
- optimized `onPropsChanged`/`onStateChanged`/`onLayoutChanged`/`onEventEmitterChanged` by calling them they actually changed ([3718106ec6](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/3718106ec6fd1047dfbfbcc3f7e3581c8232f7c8))
- optimized first core components rendering by skipping setting default props ([1dac41647e](https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/1dac41647ed42cc6b776be7bf954d0482a5c82a6))


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
