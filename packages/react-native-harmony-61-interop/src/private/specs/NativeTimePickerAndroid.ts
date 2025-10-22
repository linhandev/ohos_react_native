/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

import type { Double } from "react-native/Libraries/Types/CodegenTypes";

type Result =
  | { action: "timeSetAction"; hour: number; minute: number }
  | { action: "dismissedAction" };

export type Options = {
  hour?: Double;
  minute?: Double;
  is24Hour: boolean;
  mode: string; // "clock" | "spinner" | "default";
};

interface Spec extends TurboModule {
  open(opts?: Options): Promise<Result>;
}

export default TurboModuleRegistry.getEnforcing<Spec>("RNTimePickerAndroid");
