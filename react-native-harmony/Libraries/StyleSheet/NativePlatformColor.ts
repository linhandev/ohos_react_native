/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { TurboModule, TurboModuleRegistry } from "react-native";

interface Spec extends TurboModule {
  getSystemColor: () => string | null;
}

export const NativePlatformColor =
  TurboModuleRegistry.getEnforcing<Spec>("PlatformColor");
