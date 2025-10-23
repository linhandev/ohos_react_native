/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";
import type { ViewProps, HostComponent, ColorValue } from "react-native";
import type {
  WithDefault,
  Float,
} from "react-native/Libraries/Types/CodegenTypes";

interface RNProgressViewProps extends ViewProps {
  progress?: WithDefault<Float, 0>;
  progressTintColor?: ColorValue | null;
  trackTintColor?: ColorValue | null;
  isIndeterminate?: WithDefault<boolean, false>;
}

export default codegenNativeComponent<RNProgressViewProps>(
  "RNProgressView"
) as HostComponent<RNProgressViewProps>;
