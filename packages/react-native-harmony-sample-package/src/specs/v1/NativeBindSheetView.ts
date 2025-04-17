import { HostComponent, ViewProps } from "react-native";
import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";

export interface NativeBindSheetViewProps extends ViewProps {}

export default codegenNativeComponent<NativeBindSheetViewProps>(
  "BindSheetView",
) as HostComponent<NativeBindSheetViewProps>;
