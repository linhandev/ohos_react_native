/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE-MIT file in the root directory of this source tree.
 */

import { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony/ts';
import NavigationTurboModulePackage from '../TurboModule/NavigationTurboModulePackage';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new NavigationTurboModulePackage(ctx)
  ];
}
