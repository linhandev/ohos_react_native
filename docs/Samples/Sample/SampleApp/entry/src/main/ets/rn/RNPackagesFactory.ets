/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE-MIT file in the root directory of this source tree.
 */

import { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony';
import { SampleTurboModulePackage } from '../TurboModule/SampleTurboModulePackage';
import { ViewPagerPackage } from '@react-native-oh-tpl/react-native-pager-view/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new SampleTurboModulePackage(ctx),
    new ViewPagerPackage(ctx),
  ];
}