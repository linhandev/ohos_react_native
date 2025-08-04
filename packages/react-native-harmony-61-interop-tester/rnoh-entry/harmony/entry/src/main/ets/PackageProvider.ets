/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { RNPackageContext, RNOHPackage } from '@rnoh/react-native-openharmony';
import ReactNativeHarmony61InteropPackage from "@rnoh/react-native-openharmony-61-interop"

// import { createRNOHPackages as createRNOHPackagesAutolinking } from "./RNOHPackagesFactory"

export function getRNOHPackages(ctx: RNPackageContext): RNOHPackage[] {
  return [
  // ...createRNOHPackagesAutolinking(ctx)
    new ReactNativeHarmony61InteropPackage(ctx)
  ]
}
