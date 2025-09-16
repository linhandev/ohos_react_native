import React from 'react';
import ArkTSNativeComponent from './specs/arkts-components/CodegenLibArkTSSampleNativeComponent';
import CppNativeComponent from './specs/cpp-components/CodegenLibCppSampleNativeComponent';
import { ViewStyle } from 'react-native';

export function CodegenLibSampleComponent({
  style,
  implementation,
  text,
  onMount,
}: {
  style: ViewStyle;
  implementation: 'ArkTS' | 'Cpp';
  onMount: (text: string) => void;
  text: string;
}) {
  if (implementation === 'ArkTS') {
    return (
      <ArkTSNativeComponent
        style={style}
        text={text}
        onMount={(e) => {
          onMount(e.nativeEvent.text);
        }}
      />
    );
  } else {
    return (
      <CppNativeComponent
        style={style}
        text={text}
        onMount={(e) => {
          onMount(e.nativeEvent.text);
        }}
      />
    );
  }
}
