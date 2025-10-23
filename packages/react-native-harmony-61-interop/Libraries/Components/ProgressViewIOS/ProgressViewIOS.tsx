/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from "react";
import {
  StyleSheet,
  processColor,
} from "@react-native-oh/react-native-harmony";
import type { ViewProps, ColorValue, ProcessedColorValue } from "react-native";
import ProgressViewNativeComponent from "../../../src/private/specs/components/ProgressViewNativeComponent";

// iOS ProgressViewIOS default colors (now as strings)
const DEFAULT_PROGRESS_TINT = "#0066CC";
const DEFAULT_TRACK_TINT = "#F5F5F7";

type Props = Readonly<
  ViewProps & {
    progressViewStyle?: "default" | "bar";
    progress?: number;
    progressTintColor?: ColorValue;
    trackTintColor?: ColorValue;
    isIndeterminate?: boolean;
  }
>;

export default function ProgressViewIOS(props: Props) {
  const {
    progress,
    progressTintColor,
    trackTintColor,
    isIndeterminate,
    style,
    ...rest
  } = props;

  const ref =
    React.useRef<React.ElementRef<typeof ProgressViewNativeComponent>>(null);

  useEffect(() => {
    if (!ref.current) return;

    const processedProps: Record<string, ProcessedColorValue> = {
      progressTintColor: processColor(
        progressTintColor ?? DEFAULT_PROGRESS_TINT
      )!,
      trackTintColor: processColor(trackTintColor ?? DEFAULT_TRACK_TINT)!,
    };

    ref.current.setNativeProps?.(processedProps);
  }, [progressTintColor, trackTintColor]);

  return (
    <ProgressViewNativeComponent
      {...rest}
      ref={ref}
      progress={progress}
      isIndeterminate={isIndeterminate}
      style={StyleSheet.compose({ height: 20 }, style)}
    />
  );
}
