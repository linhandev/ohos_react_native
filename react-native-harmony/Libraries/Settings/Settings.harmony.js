/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

const Settings = {
  get(key: string): mixed {
    return null;
  },

  set(settings: Object) {},

  watchKeys(keys: string | Array<string>, callback: Function): number {
    return -1;
  },

  clearWatch(watchId: number) {},
};

module.exports = Settings;
