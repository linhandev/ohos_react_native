/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

/**
 * Restores legacy listener-removal methods for NativeEventEmitter.
 *
 * Context:
 * - RN 0.61 exposed two removal paths on NativeEventEmitter:
 *   1) removeSubscription(subscription)
 *   2) removeListener(event, handler) (inherited from EventEmitter) - removes all
 *      subscriptions registered with the same handler for the given event.
 * - Since RN >= 0.65/0.77 these legacy entry points are no longer present;
 *   instead, listeners should be removed by calling `remove()` on the subscription.
 *
 * This shim reintroduces both legacy listener-removal methods:
 *   1) removeSubscription(subscription) - delegates to subscription.remove()
 *   2) removeListener(event, handler) - via restoreRemoveListener helper
 *
 * The patch is idempotent – calling it multiple times for the same module is
 * safe.
 */

const BaseNativeEventEmitter =
  require('@react-native-oh/react-native-harmony/Libraries/EventEmitter/NativeEventEmitter').default;
const restoreRemoveListener = require('../../compat/restoreRemoveListener');

if (typeof BaseNativeEventEmitter.prototype.removeSubscription !== 'function') {
  BaseNativeEventEmitter.prototype.removeSubscription = function removeSubscription(subscription) {
    if (!subscription || typeof subscription.remove !== 'function') {
      return;
    }
    subscription.remove();
  };
}

class NativeEventEmitter extends BaseNativeEventEmitter {
  constructor(nativeModule) {
    super(nativeModule);
    restoreRemoveListener(this, 'addListener', 'removeListener');
  }
}

module.exports = NativeEventEmitter;
module.exports.default = NativeEventEmitter;
