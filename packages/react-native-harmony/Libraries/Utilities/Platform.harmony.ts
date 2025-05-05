/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NativePlatformConstantsHarmony } from './NativePlatformConstantsHarmony.harmony';
import type {
  PlatformHarmonyStatic,
  PlatformHarmonyConstants,
  PlatformOSType,
} from './Platform';

module.exports = {
  _constants: undefined,
  OS: 'harmony',

  get constants() {
    if (this._constants == null) {
      this._constants = NativePlatformConstantsHarmony.getConstants();
    }
    return this._constants!;
  },

  get Version() {
    return this.constants.osFullName;
  },

  get isPad() {
    return this.constants.deviceType === 'tablet';
  },

  get isTV() {
    return this.constants.deviceType === 'tv';
  },

  get isTesting() {
    if (__DEV__) {
      return this.constants.isTesting;
    }
    return false;
  },

  select<T>(
    spec:
      | ({ [platform in PlatformOSType]?: T } & { default: T })
      | { [platform in PlatformOSType]: T }
  ) {
    return 'harmony' in spec
      ? spec.harmony
      : 'native' in spec
        ? spec.native
        : spec.default;
  },
} satisfies PlatformHarmonyStatic & {
  _constants: undefined | PlatformHarmonyConstants;
};
