/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
  setRuntimeConfigProvider,
} = require('../NativeComponent/NativeComponentRegistry');

setRuntimeConfigProvider((_viewConfigName) => {
  return {
    /**
     * A ViewConfig describe what a component can send "to" and "from" the native side.
     * On iOS/Android ViewConfigs for core components are configured in JS.
     *
     * In RNOH, ViewConfigs for core components are defined on the native side in ComponentJSIBinders.
     * Native ViewConfigs are prefered for RNOH because they:
     * 1) don't require patching RN
     * 2) improve code consistency by using the same approach that is used by third party components
     *
     * After upgrading RNOH to 0.77 and enabling bridgless, RNOH needs to inform RN explicitly to continue using native ViewConfigs.
     *
     * ReactNativeFeatureFlags.js::useNativeViewConfigsInBridgelessMode can't be used here, because this code is executed before TurboModules can be used.
     */
    native: true,
    verify: false,
  };
});
