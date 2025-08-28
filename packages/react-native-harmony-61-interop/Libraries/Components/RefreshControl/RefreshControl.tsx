/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * [INTEROP-WRAPPER]
 * Wraps Harmony RefreshControl to adapt RN 0.61 semantics.
 * The `size` prop is the only user-facing change between 0.61 and 0.77
 * For reference on the usage of the old values, see:
 *   - RN 0.61 official docs: https://reactnative-archive-august-2023.netlify.app/docs/0.61/refreshcontrol#size
 *   - RN 0.64 official docs listing the explicit mapping of `size` on Android: https://reactnative-archive-august-2023.netlify.app/docs/0.64/refreshcontrol#refreshlayoutconstssize
 *   - RN 0.6x changelog listing commits where the type of the prop changed: https://github.com/facebook/react-native/blob/main/CHANGELOG-0.6x.md?plain=1#L1091
 */
import React from "react";
import RNOHRefreshControl from "@react-native-oh/react-native-harmony/Libraries/Components/RefreshControl/RefreshControl";

const RefreshLayoutSize = {
  LARGE: 0,
  DEFAULT: 1,
} as const;

// Exact enum values taken from RN 0.64 docs, see file doc for link
type Size61 =
  | RefreshLayoutSize.LARGE
  | RefreshLayoutSize.DEFAULT
  | null
  | undefined;

type RNOHRefreshControlSize = "default" | "large" | null | undefined;

function adaptSize61(old: Size61): RNOHRefreshControlSize {
  switch (old) {
    case RefreshLayoutSize.LARGE:
      return "large";
    case RefreshLayoutSize.DEFAULT:
    default:
      return "default";
  }
}

const RefreshControl = React.forwardRef(({ size, ...props }, ref) => {
  return <RNOHRefreshControl ref={ref} size={adaptSize61(size)} {...props} />;
});

// Export the enum to the user
RefreshControl.SIZE = RefreshLayoutSize;
RefreshControl.displayName = "RefreshControl";

export default RefreshControl;
