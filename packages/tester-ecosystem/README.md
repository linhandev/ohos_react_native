# React Native OpenHarmony Ecosystem Tester

The Ecosystem Tester verifies that the provided RNOH version does not introduce compile-time errors in projects that use common RNOH libraries. Based on the results of testing, RNOH maintainers can evaluate impact of removing deprecated software elements belonging to the native API.

https://gitee.com/react-native-oh-library/usage-docs#rnoh-%E4%B8%89%E6%96%B9%E5%BA%93%E6%80%BB%E8%A7%88		

NOTE: If you are a library maintainer and the status of your library in the table below is outdated, please create a MR.

| Library name                                                 | Status |
| ------------------------------------------------------------ | ------ |
| @react-native-oh-tpl/async-storage                           | ✅      |
| @react-native-oh-tpl/camera-roll                             |        |
| @react-native-oh-tpl/clipboard                               | ✅      |
| @react-native-oh-tpl/blurReleases                            | ✅      |
| @react-native-oh-tpl/react-native-checkbox                   | ✅      |
| @react-native-oh-tpl/datetimepicker                          | ✅      |
| @react-native-oh-tpl/geolocation                             | ✅      |
| @react-native-oh-tpl/netinfo                                 | ✅      |
| @react-native-oh-tpl/progress-bar-android                    |        |
| @react-native-oh-tpl/progress-view                           |        |
| @react-native-oh-tpl/push-notification-ios                   |        |
| @react-native-oh-tpl/slider                                  |        |
| @react-native-oh-tpl/toolbar-android                         |        |
| @react-native-oh-tpl/cookies                                 | ✅      |
| @react-native-oh-tpl/masked-view                             | ✅      |
| @react-native-oh-tpl/picker                                  |        |
| @react-native-oh-tpl/segmented-control                       |        |
| @react-native-oh-tpl/elements                                | ✅      |
| @react-native-oh-tpl/flash-list                              | ✅      |
| @react-native-oh-tpl/lottie-react-native                     | ✅      |
| @react-native-oh-tpl/react-native-autoheight-webview         |        |
| @react-native-oh-tpl/react-native-blob-util                  |        |
| @react-native-oh-tpl/react-native-drag-sort                  |        |
| @react-native-oh-tpl/react-native-exception-handler          | ✅      |
| @react-native-oh-tpl/react-native-fast-image                 |        |
| @react-native-oh-tpl/react-native-fit-Image                  |        |
| @react-native-oh-tpl/react-native-fs                         |        |
| @react-native-oh-tpl/react-native-gesture-handler            |        |
| @react-native-oh-tpl/react-native-image-editor               |        |
| @react-native-oh-tpl/react-native-image-picker               | ✅      |
| react-native-image-viewer                                    | ✅      |
| @react-native-oh-tpl/react-native-image-viewing              |        |
| @react-native-oh-tpl/react-native-image-pan-zoom             |        |
| @react-native-oh-tpl/react-native-intersection-observer      |        |
| @react-native-oh-tpl/react-native-keyboard-aware-scroll-view | ✅      |
| @react-native-oh-tpl/react-native-linear-gradient            | ✅      |
| @react-native-oh-tpl/react-native-maps                       |        |
| @react-native-oh-tpl/react-native-markdown-display           |        |
| @react-native-oh-tpl/react-native-marquee                    |        |
| @react-native-oh-tpl/react-native-mjrefresh                  |        |
| @react-native-oh-tpl/react-native-pager-view                 |        |
| @react-native-oh-tpl/react-native-pdf                        |        |
| @react-native-oh-tpl/react-native-permissions                |        |
| @react-native-oh-tpl/react-native-popover-view               |        |
| @react-native-oh-tpl/react-native-progress                   |        |
| @react-native-oh-tpl/react-native-pull                       |        |
| @react-native-oh-tpl/react-native-reanimated                 |        |
| @react-native-oh-tpl/react-native-safe-area-context          |        |
| @react-native-oh-tpl/react-native-scrollable-tab-view        |        |
| @react-native-oh-tpl/react-native-SmartRefreshLayout         |        |
| @react-native-oh-tpl/react-native-snap-carousel              |        |
| @react-native-oh-tpl/react-native-sound                      |        |
| @react-native-oh-tpl/react-native-stickyheader               |        |
| @react-native-oh-tpl/react-native-svg                        | ❌      |
| @react-native-oh-tpl/react-native-tab-view                   |        |
| @react-native-oh-tpl/react-native-text-size                  |        |
| @react-native-oh-tpl/react-native-transitiongroup            |        |
| @react-native-oh-tpl/react-native-translucent-modal          |        |
| @react-native-oh-tpl/react-native-video                      |        |
| @react-native-oh-tpl/react-native-view-shot                  |        |
| @react-native-oh-tpl/react-native-webview                    |        |
| @react-native-oh-tpl/react-native-worklets-core              |        |
| @react-native-oh-tpl/react-native-sensors                    |        |
| @react-native-oh-tpl/react-native-sortable-list              |        |
| @react-native-oh-tpl/react-native-image-sequence-2           |        |
| @react-native-oh-tpl/native-stack                            |        |
| @react-native-oh-tpl/react-native-clippath                   |        |
| @react-native-oh-tpl/react-native-image-gallery              |        |
| @react-native-oh-tpl/react-native-image-crop-picker          |        |
| @react-native-oh-tpl/react-native-image-capinsets-next       |        |
| @react-native-oh-tpl/react-native-map-linking                |        |
| @react-native-oh-tpl/react-native-vision-camera              |        |
| @react-native-oh-tpl/react-native-zip-archive                |        |
| @react-native-oh-tpl/react-native-audio                      |        |
| @react-native-oh-tpl/react-native-simple-toast               |        |
| @react-native-oh-tpl/react-native-localize                   |        |
| @react-native-oh-tpl/react-native-image-resizer              |        |
| @react-native-oh-tpl/react-native-calendar-events            |        |
| @react-native-oh-tpl/react-native-fileupload                 |        |
| @react-native-oh-tpl/react-native-root-modal                 |        |
| @react-native-oh-tpl/react-native-switch-pro                 |        |
| @react-native-oh-tpl/react-native-nested-scroll-view         |        |
| @react-native-oh-tpl/react-native-code-push                  |        |
| @react-native-oh-tpl/react-native-safe-module                |        |
| @react-native-oh-tpl/react-native-sqlite-storage             |        |
| @react-native-oh-tpl/react-native-text-gradient              |        |
| @react-native-oh-tpl/react-native-bindingx                   |        |
| @react-native-oh-tpl/react-native-cardview                   |        |
| @react-native-oh-tpl/react-native-largelist                  |        |
| @react-native-oh-tpl/react-native-spring-scrollview          |        |
| @react-native-oh-tpl/react-native-color-matrix-image-filters |        |
| @react-native-oh-tpl/react-native-toast                      |        |
| @react-native-oh-tpl/react-native-syan-image-picker          |        |
| @react-native-oh-tpl/react-native-amap-geolocation           |        |
| @react-native-oh-tpl/react-native-splash-screen              |        |
| @react-native-oh-tpl/react-native-baidu-map                  |        |
| @react-native-oh-tpl/react-native-ble-plx                    |        |
| @react-native-oh-tpl/react-native-device-info                |        |
| @react-native-oh-tpl/react-native-amap3d                     |        |
| @react-native-oh-tpl/react-native-background-timer           |        |
| @react-native-oh-tpl/react-native-http-bridge                |        |
| @react-native-oh-tpl/react-native-qr-decode-image-camera     |        |
| @react-native-oh-tpl/react-native-touch-id                   |        |
| @react-native-oh-tpl/react-native-modal                      |        |
| @react-native-oh-tpl/react-native-restart                    |        |
| @react-native-oh-tpl/react-native-system-setting             |        |
| @react-native-oh-tpl/react-native-keep-awake                 |        |
| @react-native-oh-tpl/react-navigation                        |        |
| @react-native-oh-tpl/react-native-default-preference         |        |
| @react-native-oh-tpl/react-native-ble-manager                |        |
| @react-native-oh-tpl/react-native-sensitive-info             |        |
| @react-native-oh-tpl/react-native-multi-slider               |        |
| @react-native-oh-tpl/react-native-orientation                |        |
| @react-native-oh-tpl/rn-tourguide                            |        |
| @react-native-oh-tpl/react-native-performance                |        |
| @react-native-oh-tpl/react-native-shake                      |        |
| @react-native-oh-tpl/react-native-document-picker            |        |
| @react-native-oh-tpl/react-native-fingerprint-scanner        |        |
| @react-native-oh-tpl/react-native-get-random-values          |        |
| @react-native-oh-tpl/native-base                             |        |
| @react-native-oh-library/react-native-orientation-locker     |        |
| @react-native-oh-tpl/nativewind                              |        |
| @react-native-oh-tpl/react-native-haptic-feedback            |        |
| @react-native-oh-tpl/react-native-credit-card-input          |        |
| @react-native-oh-tpl/react-native-unistyles                  |        |
| @react-native-oh-tpl/react-native-signature-capture          |        |
| @react-native-oh-library/react-native-vector-drawable        |        |
| @react-native-oh-tpl/react-native-material-buttons           |        |
| @react-native-oh-tpl/react-native-create-thumbnail           |        |
| @react-native-oh-tpl/react-native-picker                     |        |
| @react-native-oh-library/bottom-sheet                        |        |
| @react-native-oh-tpl/react-native-skia                       |        |
| @react-native-oh-tpl/react-native-inappbrowser-reborn        |        |
| @react-native-oh-tpl/react-native-picker-select              |        |
| @react-native-oh-tpl/react-native-charts-wrapper             |        |
| @react-native-oh-tpl/react-native-context-menu-view          |        |
| @react-native-oh-tpl/react-native-material-textfield         |        |
| @react-native-oh-tpl/react-native-iphone-screen-helper       |        |
| @react-native-oh-tpl/react-native-randombytes                |        |
| @react-native-oh-tpl/react-native-view-overflow              |        |
| @react-native-oh-tpl/react-native-image-zoom-viewer          | ✅      |
| @react-native-oh-tpl/audio-toolkit                           |        |
| @react-native-oh-tpl/react-native-svg-charts                 |        |
| @react-native-oh-tpl/react-native-file-viewer                |        |
| @react-native-oh-tpl/react-native-image-colors               |        |
| @react-native-oh-tpl/react-content-loader                    |        |
| @react-native-oh-tpl/react-native-audio-recorder-player      |        |
| @react-native-oh-tpl/react-native-tts                        |        |
| @react-native-oh-tpl/react-native-incall-manager             |        |
| @react-native-oh-library/react-native-securerandom           |        |
| @react-native-oh-tpl/react-native-network-info               |        |
| @react-native-oh-tpl/react-native-mlkit-ocr                  |        |
| @react-native-oh-tpl/op-sqlite                               |        |
| @react-native-oh-library/react-native-keys                   |        |
| @react-native-oh-tpl/react-native-barcode-builder            |        |
| @react-native-oh-tpl/react-native-neomorph-shadows           |        |
| @react-native-oh-tpl/react-native-drax                       |        |
| @react-native-oh-library/react-native-video-cache            |        |
| @react-native-oh-tpl/react-native-qrcode                     |        |
| @react-native-oh-tpl/react-native-tab-navigator              |        |
| @react-native-oh-tpl/react-native-doc-viewer                 |        |
| @react-native-ohos-community/auto-fill                       |        |
| @react-native-oh-tpl/victory-native-xl                       |        |
| @react-native-oh-tpl/react-native-textinput-maxlength-fixed  |        |
| @react-native-oh-library/react-native-config                 |        |
| @react-native-oh-tpl/realm-js                                |        |
| @react-native-oh-tpl/react-native-ssl-pinning                |        |