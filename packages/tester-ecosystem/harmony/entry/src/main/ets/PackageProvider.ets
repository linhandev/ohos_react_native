import { AsyncStoragePackage } from '@react-native-oh-tpl/async-storage';
import { ClipboardPackage } from '@react-native-oh-tpl/clipboard';
import { CookiesPackage } from '@react-native-oh-tpl/cookies';
import { GeoLocationPackage } from '@react-native-oh-tpl/geolocation';
import { LottieAnimationViewPackage } from '@react-native-oh-tpl/lottie-react-native/ts';
import { NetInfoPackage } from '@react-native-oh-tpl/netinfo/ts';
import { ExceptionHandlerPackage } from '@react-native-oh-tpl/react-native-exception-handler';
import { ImagePickerViewPackage } from '@react-native-oh-tpl/react-native-image-picker';
import {ToolbarAndroidPackage} from '@react-native-ohos/toolbar-android/src/main/ets/ToolbarAndroidPackage';

import type { RNPackageContext, RNOHPackage, RNPackage } from '@rnoh/react-native-openharmony';
import { createRNOHPackages as createRNOHPackagesAutolinking } from "./RNOHPackagesFactory"

export function getRNOHPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    ...createRNOHPackagesAutolinking(ctx),
    new AsyncStoragePackage(ctx),
    new ClipboardPackage(ctx),
    new GeoLocationPackage(ctx),
    new NetInfoPackage(ctx),
    new CookiesPackage(ctx),
    new LottieAnimationViewPackage(ctx),
    new ExceptionHandlerPackage(ctx),
    new ImagePickerViewPackage(ctx),
    new ToolbarAndroidPackage(ctx),
  ]
}
