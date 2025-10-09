import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import RNMaskedView from "../../../src/private/specs/components/MaskedViewNativeComponent";

export type MaskedViewProps = Partial<import("react-native").ViewProps> & {
  children?: React.ReactNode;
  maskElement: React.ReactNode;
};

export default function MaskedView(props: MaskedViewProps) {
  const { maskElement, children, ...otherViewProps } = props;
  const hasWarnedInvalidRenderMaskRef = useRef(false);

  if (!React.isValidElement(maskElement)) {
    if (!hasWarnedInvalidRenderMaskRef.current) {
      console.warn(
        "MaskedView: Invalid `maskElement` prop was passed to MaskedView. Expected a React Element. No mask will render."
      );
      hasWarnedInvalidRenderMaskRef.current = true;
    }
    return <View {...otherViewProps}>{children}</View>;
  }

  return (
    <RNMaskedView {...otherViewProps}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {maskElement}
      </View>
      {children}
    </RNMaskedView>
  );
}
