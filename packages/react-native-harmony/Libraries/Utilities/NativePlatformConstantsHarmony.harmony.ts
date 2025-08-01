/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { PlatformHarmonyConstants } from './Platform';
import * as TurboModuleRegistry from '../TurboModule/TurboModuleRegistry';
import type { TurboModule } from '../TurboModule/RCTExport';

interface Spec extends TurboModule {
  getConstants: () => PlatformHarmonyConstants;
}

export const NativePlatformConstantsHarmony =
  TurboModuleRegistry.getEnforcing<Spec>('PlatformConstants');
