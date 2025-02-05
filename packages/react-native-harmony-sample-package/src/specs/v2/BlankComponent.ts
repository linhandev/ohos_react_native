import { HostComponent, ViewProps } from "react-native";
import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";

export interface BlankNativeProps extends ViewProps {}
export type BlankProps = BlankNativeProps;

export default codegenNativeComponent<BlankNativeProps>(
  "Blank",
) as HostComponent<BlankNativeProps>;
