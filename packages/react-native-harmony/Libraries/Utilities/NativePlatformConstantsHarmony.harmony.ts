/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TurboModule, TurboModuleRegistry } from 'react-native';
import type { PlatformHarmonyConstants } from './Platform';

interface Spec extends TurboModule {
  getConstants: () => PlatformHarmonyConstants;
}

export const NativePlatformConstantsHarmony =
  TurboModuleRegistry.getEnforcing<Spec>('PlatformConstants');
