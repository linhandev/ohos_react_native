/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default {
  get(key: string): null | unknown {
    return null;
  },

  set(settings: Object) {},

  watchKeys(keys: string | string[], callback: () => void): number {
    return -1;
  },

  clearWatch(watchId: number) {},
};
