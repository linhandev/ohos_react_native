import { DescriptorWrapperFactoryByDescriptorType, UITurboModuleFactory, WorkerTurboModuleFactory, WorkerTurboModule } from '../RNOH/ts';
import { RNPackage } from "../RNOH/RNPackage"
import type { UITurboModule } from '../RNOH/TurboModule';
import type { UITurboModuleContext, WorkerTurboModuleContext } from "../RNOH/RNOHContext"
import {
  AccessibilityInfoTurboModule,
  AlertManagerTurboModule,
  AppearanceTurboModule,
  AppStateTurboModule,
  BlobTurboModule,
  DeviceEventManagerTurboModule,
  DeviceInfoTurboModule,
  DevLoadingViewTurboModule,
  DevMenuTurboModule,
  DevSettingsTurboModule,
  ExceptionsManagerTurboModule,
  FileReaderTurboModule,
  I18nManagerTurboModule,
  ImageLoaderTurboModule,
  KeyboardObserverTurboModule,
  LogBoxTurboModule,
  NativeAnimatedTurboModule,
  NetworkingTurboModule,
  PlatformColorTurboModule,
  PlatformConstantsTurboModule,
  SafeAreaTurboModule,
  ShareTurboModule,
  SourceCodeTurboModule,
  StatusBarTurboModule,
  TimingTurboModule,
  ToastAndroidTurboModule,
  VibrationTurboModule,
  WebSocketTurboModule,
  ImageLoaderWorkerTurboModule
} from './turboModules';
import { LinkingManagerTurboModule } from './turboModules/LinkingManagerTurboModule';
import { ViewDescriptorWrapper } from './components/ts';

export class RNOHCorePackage extends RNPackage {
  createUITurboModuleFactory(ctx: UITurboModuleContext): UITurboModuleFactory {
    return new CoreUITurboModulesFactory(ctx);
  }

  createWorkerTurboModuleFactory(ctx: WorkerTurboModuleContext): WorkerTurboModuleFactory | null {
    return new CoreWorkerTurboModulesFactory(ctx)
  }

  createDescriptorWrapperFactoryByDescriptorType({}): DescriptorWrapperFactoryByDescriptorType {
    return { View: ctx => new ViewDescriptorWrapper(ctx.descriptor) };
  }

  getDebugName() {
    return 'rnoh';
  }
}

const UI_TURBO_MODULE_CLASS_BY_NAME: Record<string, typeof UITurboModule> = {
  [AccessibilityInfoTurboModule.NAME]: AccessibilityInfoTurboModule,
  [AlertManagerTurboModule.NAME]: AlertManagerTurboModule,
  [AppearanceTurboModule.NAME]: AppearanceTurboModule,
  [AppStateTurboModule.NAME]: AppStateTurboModule,
  [BlobTurboModule.NAME]: BlobTurboModule,
  [DeviceEventManagerTurboModule.NAME]: DeviceEventManagerTurboModule,
  [DevSettingsTurboModule.NAME]: DevSettingsTurboModule,
  [DevMenuTurboModule.NAME]: DevMenuTurboModule,
  [ExceptionsManagerTurboModule.NAME]: ExceptionsManagerTurboModule,
  [FileReaderTurboModule.NAME]: FileReaderTurboModule,
  [ImageLoaderTurboModule.NAME]: ImageLoaderTurboModule,
  [KeyboardObserverTurboModule.NAME]: KeyboardObserverTurboModule,
  [NativeAnimatedTurboModule.NAME]: NativeAnimatedTurboModule,
  [LinkingManagerTurboModule.NAME]: LinkingManagerTurboModule,
  [NetworkingTurboModule.NAME]: NetworkingTurboModule,
  [PlatformColorTurboModule.NAME]: PlatformColorTurboModule,
  [PlatformConstantsTurboModule.NAME]: PlatformConstantsTurboModule,
  [ShareTurboModule.NAME]: ShareTurboModule,
  [SourceCodeTurboModule.NAME]: SourceCodeTurboModule,
  [TimingTurboModule.NAME]: TimingTurboModule,
  [WebSocketTurboModule.NAME]: WebSocketTurboModule,
  [I18nManagerTurboModule.NAME]: I18nManagerTurboModule,
  [LogBoxTurboModule.NAME]: LogBoxTurboModule,
  [DevLoadingViewTurboModule.NAME]: DevLoadingViewTurboModule,
  [VibrationTurboModule.NAME]: VibrationTurboModule,
  [ToastAndroidTurboModule.NAME]: ToastAndroidTurboModule,
};

const EAGER_UI_TURBO_MODULE_CLASS_BY_NAME = {
  [DeviceInfoTurboModule.NAME]: DeviceInfoTurboModule,
  [StatusBarTurboModule.NAME]: StatusBarTurboModule,
  [SafeAreaTurboModule.NAME]: SafeAreaTurboModule,
} as const;

class CoreUITurboModulesFactory extends UITurboModuleFactory {
  private eagerTurboModuleByName: Partial<Record<keyof typeof EAGER_UI_TURBO_MODULE_CLASS_BY_NAME, UITurboModule>> = {};

  async prepareEagerTurboModules() {
    const statusBarTurboModule = new StatusBarTurboModule(this.ctx);
    this.eagerTurboModuleByName = {
      [SafeAreaTurboModule.NAME]: await SafeAreaTurboModule.create(
        this.ctx,
        statusBarTurboModule,
      ),
      [StatusBarTurboModule.NAME]: statusBarTurboModule,
      [DeviceInfoTurboModule.NAME]: await DeviceInfoTurboModule.create(
        this.ctx,
      ),
    };
  }

  createTurboModule(name: string): UITurboModule {
    if (this.eagerTurboModuleByName[name]) {
      return this.eagerTurboModuleByName[name];
    }
    if (this.hasTurboModule(name)) {
      return new UI_TURBO_MODULE_CLASS_BY_NAME[name](this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return (
      name in UI_TURBO_MODULE_CLASS_BY_NAME || name in this.eagerTurboModuleByName
    );
  }
}

const WORKER_TURBO_MODULE_CLASS_BY_NAME: Record<string, typeof WorkerTurboModule> = {
  [ImageLoaderWorkerTurboModule.NAME]: ImageLoaderWorkerTurboModule,
};

class CoreWorkerTurboModulesFactory extends WorkerTurboModuleFactory {
  createTurboModule(name: string): WorkerTurboModule {
    if (this.hasTurboModule(name)) {
      return new WORKER_TURBO_MODULE_CLASS_BY_NAME[name](this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    if (this.ctx.rnInstance.getArchitecture() === "ARK_TS" && name == ImageLoaderWorkerTurboModule.NAME) {
      // fallback to UI version of ImageLoaderTurboModule in ArkTS architecture because RNImage uses it
      return false;
    }
    return (
      name in WORKER_TURBO_MODULE_CLASS_BY_NAME
    );
  }
}


