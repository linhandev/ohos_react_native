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
 *      subscription object returned for every `(eventType, listener)` pair.
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
    console.warn(`[restoreRemoveListener] Cannot patch. '${addName}' is missing on target`);
    return;
  }

  // If legacy method already exists – do nothing.
  if (typeof target[removeName] === 'function') {
    return;
  }

  /** Map<eventType, Map<listener, Set<subscription>>> */
  const subsByListenerByEventType = new Map();

  // Patch add* so that we can later find the subscription.
  const originalAdd = target[addName];
  target[addName] = function patchedAdd(eventType, listener, ...rest) {
    const subscription = originalAdd.call(this, eventType, listener, ...rest);
    let subsByListener = subsByListenerByEventType.get(eventType);
    if (!subsByListener) {
      subsByListener = new Map();
      subsByListenerByEventType.set(eventType, subsByListener);
    }
    let listenerSubs = subsByListener.get(listener);
    if (!listenerSubs) {
      listenerSubs = new Set();
      subsByListener.set(listener, listenerSubs);
    }
    listenerSubs.add(subscription);
    // Ensure cleanup also if consumer calls subscription.remove() directly.
    if (subscription && typeof subscription.remove === 'function') {
      const originalRemove = subscription.remove.bind(subscription);
      subscription.remove = function patchedSubscriptionRemove(...args) {
        try {
          return originalRemove(...args);
        } finally {
          const subsByListener = subsByListenerByEventType.get(eventType);
          if (subsByListener) {
            const listenerSubs = subsByListener.get(listener);
            if (listenerSubs) {
              listenerSubs.delete(subscription);
              if (listenerSubs.size === 0) {
                subsByListener.delete(listener);
              }
            }
            if (subsByListener.size === 0) {
              subsByListenerByEventType.delete(eventType);
            }
          }
        }
      };
    }
    return subscription;
  };

  // Define legacy remove* API.
  target[removeName] = function legacyRemove(eventType, listener) {
    const subsByListener = subsByListenerByEventType.get(eventType);
    const listenerSubs = subsByListener ? subsByListener.get(listener) : undefined;
    if (listenerSubs && listenerSubs.size > 0) {
      // Remove all subscriptions for this (eventType, listener)
      for (const sub of Array.from(listenerSubs)) {
        if (sub && typeof sub.remove === 'function') {
          sub.remove();
        }
      }
      subsByListener.delete(listener);
      if (subsByListener.size === 0) {
        subsByListenerByEventType.delete(eventType);
      }
    }
  };

  // Optional cleanup for removeAllListeners to avoid stale entries in our map
  const hasRemoveAll = typeof target.removeAllListeners === 'function';
  if (hasRemoveAll && !target.__rnohPatchedRemoveAll) {
    const originalRemoveAll = target.removeAllListeners.bind(target);
    target.removeAllListeners = function patchedRemoveAllListeners(eventType) {
      const result = originalRemoveAll(eventType);
      subsByListenerByEventType.delete(eventType);
      return result;
    };
    // Mark as patched to keep idempotency
    Object.defineProperty(target, '__rnohPatchedRemoveAll', {value: true});
  }
}

module.exports = restoreRemoveListener;
