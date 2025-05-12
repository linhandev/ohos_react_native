import { AsyncStoragePackage } from '@react-native-oh-tpl/async-storage';
import { ClipboardPackage } from '@react-native-oh-tpl/clipboard';
import { CookiesPackage } from '@react-native-oh-tpl/cookies';
import { GeoLocationPackage } from '@react-native-oh-tpl/geolocation';
import { LottieAnimationViewPackage } from '@react-native-oh-tpl/lottie-react-native/ts';
import { NetInfoPackage } from '@react-native-oh-tpl/netinfo/ts';
import { ExceptionHandlerPackage } from '@react-native-oh-tpl/react-native-exception-handler';
import { ImagePickerViewPackage } from '@react-native-oh-tpl/react-native-image-picker';
import { ToolbarAndroidPackage } from 'rnoh-toolbar-android/src/main/ets/ToolbarAndroidPackage';
import { RNMlkitOcrPackage } from '@react-native-oh-tpl/react-native-mlkit-ocr/ts';
import { RNNetworkInfoPackage } from '@react-native-oh-tpl/react-native-network-info/ts';
import { AutoFillPackage } from '@react-native-ohos-community/auto-fill/ts'
import { RNInCallManagerPackage } from '@react-native-oh-tpl/react-native-incall-manager/ts';
import { RNTTSPackage } from '@react-native-oh-tpl/react-native-tts/ts';
import { RNImageColorsPackage } from "@react-native-oh-tpl/react-native-image-colors/ts";
import { RNFileViewerPackage } from '@react-native-oh-tpl/react-native-file-viewer/ts';
import { RNTextinputMaxlengthFixedPackage } from "@react-native-oh-tpl/react-native-textinput-maxlength-fixed/ts";
import { RNEmailLinkPackage } from '@react-native-oh-tpl/react-native-email-link/ts';
import { RandomBytesPackage } from '@react-native-oh-tpl/react-native-randombytes/ts';
import { PDFViewPackage } from '@react-native-oh-tpl/react-native-view-pdf/ts'
import { ChartsWrapperPackage } from '@react-native-oh-tpl/react-native-charts-wrapper/ts';
import { BlurhashPackage } from '@react-native-oh-tpl/react-native-blurhash/ts';
import { RNNfcManagerPackage } from '@react-native-oh-tpl/react-native-nfc-manager/ts';
import { RTNCameraKitPackage } from "@react-native-oh-tpl/react-native-camera-kit/ts";
import { RNAppleAuthPackage } from '@react-native-oh-tpl/react-native-apple-authentication';
import { RNTrackPlayerPackage } from "@react-native-oh-tpl/react-native-track-player/ts";
import { RNInAppBrowserPackage } from '@react-native-oh-tpl/react-native-inappbrowser-reborn/ts';
import { RNPrintPackage } from '@react-native-oh-tpl/react-native-print/ts';
import { UiLibPackage } from '@react-native-oh-tpl/react-native-ui-lib/ts';
import { RNHapticFeedbackPackage } from '@react-native-oh-tpl/react-native-haptic-feedback/ts'
import { RNBootSplashPackage } from '@react-native-oh-tpl/react-native-bootsplash/ts';
import { SyanImagePickerPackage } from '@react-native-oh-tpl/react-native-syan-image-picker/ts';
import { ToastPackage } from '@react-native-oh-tpl/react-native-toast/ts';
import { RNOrientationLockerPackage } from '@react-native-oh-tpl/react-native-orientation-locker/ts';
import { RNGetRandomValuesPackage } from "@react-native-oh-tpl/react-native-get-random-values/ts";
import { RNFingerprintScannerPackage } from '@react-native-oh-tpl/react-native-fingerprint-scanner/ts';
import { ShakePackage } from "@react-native-oh-tpl/react-native-shake/ts";
import { RNDefaultPreferencePackage } from '@react-native-oh-tpl/react-native-default-preference/ts';
import { RNKeepAwakePackage } from "@react-native-oh-tpl/react-native-keep-awake/ts";
import { RNSystemSettingPackage } from '@react-native-oh-tpl/react-native-system-setting/ts';
import { RNRestartPackage } from '@react-native-oh-tpl/react-native-restart/ts';
import { RNHttpBridgePackage } from "@react-native-oh-tpl/react-native-http-bridge/ts";
import { AMapGeolocationPackage } from '@react-native-oh-tpl/react-native-amap-geolocation/ts';
import { ZipArchivePackage } from '@react-native-oh-tpl/react-native-zip-archive/ts';
import { RNCImageCapInsetsPackage } from '@react-native-oh-tpl/react-native-image-capinsets-next/ts';
import { ClipPathPackage } from '@react-native-oh-tpl/react-native-clippathview/ts';
import { ImageSequencePackage } from "@react-native-ohos/react-native-image-sequence-2/ts";
import { SensorsPackage } from '@react-native-ohos/react-native-sensors/ts';
import { WorkletsPackage } from "@react-native-oh-tpl/react-native-worklets-core/ts";
import { RNTextSizePackage } from '@react-native-oh-tpl/react-native-text-size/ts';
import { ImageEditorPackage } from '@react-native-ohos/image-editor/ts';
import { RNUserAgentPackage } from '@react-native-oh-tpl/react-native-user-agent/ts';
import { RNImageRotatePackage } from '@react-native-oh-tpl/react-native-image-rotate/ts';
import { DocViewPackage } from "@react-native-oh-tpl/react-native-doc-viewer/ts";
import { RNThumbnailPackage } from '@react-native-oh-tpl/react-native-thumbnail/ts';
import { RNCustomKeyboardPackage } from '@react-native-oh-tpl/react-native-custom-keyboard/ts';
import { RNBuglyPackage } from '@react-native-oh-tpl/rn-bugly/ts';
import { RNReactLocalizationPackage } from '@react-native-oh-tpl/react-native-localization';
import { RNJPushPackage } from "@react-native-oh-tpl/jpush-react-native/ts";
import { RNTextInputMaskPackage } from '@react-native-oh-tpl/react-native-text-input-mask/ts'
import { RNConfigPackage } from '@react-native-oh-tpl/react-native-config/ts';

import type { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony';
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
    new RNMlkitOcrPackage(ctx),
    new RNNetworkInfoPackage(ctx),
    new AutoFillPackage(ctx),
    new RNInCallManagerPackage(ctx),
    new RNTTSPackage(ctx),
    new RNImageColorsPackage(ctx),
    new RNFileViewerPackage(ctx),
    new RNTextinputMaxlengthFixedPackage(ctx),
    new RNEmailLinkPackage(ctx),
    new RandomBytesPackage(ctx),
    new PDFViewPackage(ctx),
    new ChartsWrapperPackage(ctx),
    new BlurhashPackage(ctx),
    new RNNfcManagerPackage(ctx),
    new RTNCameraKitPackage(ctx),
    new RNAppleAuthPackage(ctx),
    new RNTrackPlayerPackage(ctx),
    new RNInAppBrowserPackage(ctx),
    new RNPrintPackage(ctx),
    new UiLibPackage(ctx),
    new RNHapticFeedbackPackage(ctx),
    new RNBootSplashPackage(ctx),
    new SyanImagePickerPackage(ctx),
    new RNOrientationLockerPackage(ctx),
    new RNGetRandomValuesPackage(ctx),
    new RNFingerprintScannerPackage(ctx),
    new ShakePackage(ctx),
    new RNDefaultPreferencePackage(ctx),
    new RNKeepAwakePackage(ctx),
    new RNSystemSettingPackage(ctx),
    new RNRestartPackage(ctx),
    new RNHttpBridgePackage(ctx),
    new AMapGeolocationPackage(ctx),
    new ToastPackage(ctx),
    new ZipArchivePackage(ctx),
    new RNCImageCapInsetsPackage(ctx),
    new ClipPathPackage(ctx),
    new ImageSequencePackage(ctx),
    new SensorsPackage(ctx),
    new WorkletsPackage(ctx),
    new RNTextSizePackage(ctx),
    new ImageEditorPackage(ctx),
    new RNUserAgentPackage(ctx),
    new RNImageRotatePackage(ctx),
    new DocViewPackage(ctx),
    new RNThumbnailPackage(ctx),
    new RNCustomKeyboardPackage(ctx),
    new RNBuglyPackage(ctx),
    new RNReactLocalizationPackage(ctx),
    new RNJPushPackage(ctx),
    new RNTextInputMaskPackage(ctx),
    new RNConfigPackage(ctx),
  ]
}
