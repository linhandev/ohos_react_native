/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

import type { IEventEmitter } from "react-native/Libraries/vendor/emitter/EventEmitter";
import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";

// FIXME: use typed events
type RCTDeviceEventDefinitions = $FlowFixMe;

type EmitterSubscription = {
  listener: Function
  // other properties of a subscription, if any
};

/**
 * Global EventEmitter used by the native platform to emit events to JavaScript.
 * Events are identified by globally unique event names.
 *
 * NativeModules that emit events should instead subclass `NativeEventEmitter`.
 */
class RCTDeviceEventEmitterImpl extends EventEmitter {
  // The listener method that works similarly to the provided listeners method
  listeners(eventType: string): Array<EmitterSubscription> {
    const subscriptions = this._subscriber?.getSubscriptionsForType(eventType);
    return subscriptions
      ? subscriptions
          // Filter out missing entries
          .filter(sparseFilterPredicate)
          .map(subscription => subscription.listener)
      : [];
  }
}

const RCTDeviceEventEmitter: IEventEmitter<RCTDeviceEventDefinitions> =
  new RCTDeviceEventEmitterImpl();

Object.defineProperty(global, "__rctDeviceEventEmitter", {
  configurable: true,
  value: RCTDeviceEventEmitter
});

export default (RCTDeviceEventEmitter: IEventEmitter<RCTDeviceEventDefinitions>);

// Helper function to filter out missing entries
function sparseFilterPredicate(sub: any): boolean {
  return sub != null;
}
