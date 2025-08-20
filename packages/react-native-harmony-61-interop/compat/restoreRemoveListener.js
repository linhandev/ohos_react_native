/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Polyfill helper that restores legacy listener-removal APIs that were removed
 * in React Native >= 0.65. Older React Native 0.61 code expects methods like
 *   `Module.removeEventListener(event, handler)` or
 *   `Module.removeListener(event, handler)`.
 *
 * In modern React Native versions listeners should be removed by calling `remove()`
 * on the subscription returned from `addEventListener` / `addListener`.
 * This helper bridges the gap by:
 *   1. Monkey-patching the original `add*` method so that it remembers the
 *      subscription object returned for every `(event, handler)` pair.
 *   2. Defining the legacy `remove*` method that looks up that subscription and
 *      calls `remove()` on it.
 *
 * The patch is idempotent – calling it multiple times for the same module is
 * safe.
 *
 * @param {object} target      The module object (e.g. AccessibilityInfo)
 * @param {string} addName     Existing method name for adding listeners
 *                             ("addEventListener" | "addListener")
 * @param {string} removeName  Legacy method name to recreate
 */
function restoreRemoveListener(target, addName, removeName) {
  if (!target || typeof target[addName] !== 'function') {
    console.warn(
      `[restoreRemoveListener] Cannot patch. '${addName}' is missing on target`,
    );
    return;
  }

  // If legacy method already exists – do nothing.
  if (typeof target[removeName] === 'function') {
    return;
  }

  /** Map<event, Map<handler, subscription>> */
  const subscriptionsByEvent = new Map();

  // Patch add* so that we can later find the subscription.
  const originalAdd = target[addName].bind(target);
  target[addName] = function patchedAdd(event, handler, ...rest) {
    const subscription = originalAdd(event, handler, ...rest);
    let subscriptionsByHandler = subscriptionsByEvent.get(event);
    if (!subscriptionsByHandler) {
      subscriptionsByHandler = new Map();
      subscriptionsByEvent.set(event, subscriptionsByHandler);
    }
    subscriptionsByHandler.set(handler, subscription);
    return subscription;
  };

  // Define legacy remove* API.
  target[removeName] = function legacyRemove(event, handler) {
    const subscriptionsByHandler = subscriptionsByEvent.get(event);
    const subscription = subscriptionsByHandler
      ? subscriptionsByHandler.get(handler)
      : undefined;
    if (subscription && typeof subscription.remove === 'function') {
      subscription.remove();
      subscriptionsByHandler.delete(handler);
    }
  };
}

module.exports = restoreRemoveListener;
