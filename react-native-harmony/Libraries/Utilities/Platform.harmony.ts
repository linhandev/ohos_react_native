/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict
 */

import { NativePlatformConstantsHarmony } from "./NativePlatformConstantsHarmony";
import type { PlatformHarmonyStatic, PlatformHarmonyConstants, PlatformOSType } from "./Platform";

const Platform = {
  __constants: undefined as undefined | PlatformHarmonyConstants,
  OS: 'harmony' as const,
  get constants() {
    if (this.__constants == null) {
      this.__constants = NativePlatformConstantsHarmony.getConstants();
    }
    return this.__constants;
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
  select<T>(spec: ({ [platform in PlatformOSType]?: T } & { default: T; }) | { [platform in PlatformOSType]: T }) {
    return 'harmony' in spec ? spec.harmony : 'native' in spec ? spec.native : spec.default;
  }
};

module.exports = Platform as PlatformHarmonyStatic;