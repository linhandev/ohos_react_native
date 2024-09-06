import type {RNPackageContext, RNPackage} from '@react-native-ohos/react-native-openharmony/ts';
import {SamplePackage} from '@react-native-ohos/sample-package/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [new SamplePackage(ctx)];
}
