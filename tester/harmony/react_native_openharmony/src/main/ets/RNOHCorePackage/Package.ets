import {
  DescriptorWrapperFactoryByDescriptorType,
  UITurboModuleFactory,
  WorkerTurboModuleFactory,
  WorkerTurboModule
} from '../RNOH/ts';
import { RNPackage } from "../RNOH/RNPackage"
import type { UITurboModule } from '../RNOH/TurboModule';
import type { UITurboModuleContext, WorkerTurboModuleContext } from "../RNOH/RNOHContext"
import {
  AccessibilityManagerTurboModule,
  AlertManagerTurboModule,
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
import { AppearanceWorkerTurboModule } from './turboModules/AppearanceWorkerTurboModule';
import { LinkingManagerTurboModule } from './turboModules/LinkingManagerTurboModule';
import { ViewDescriptorWrapper } from './components/ts';

export class RNOHCorePackage extends RNPackage {
  createUITurboModuleFactory(ctx: UITurboModuleContext): UITurboModuleFactory {
    return new CoreUITurboModulesFactory(ctx);
  }

  createWorkerTurboModuleFactory(ctx: WorkerTurboModuleContext): WorkerTurboModuleFactory | null {
    return new CoreWorkerTurboModulesFactory(ctx)
  }

  createDescriptorWrapperFactoryByDescriptorType(): DescriptorWrapperFactoryByDescriptorType {
    return { View: ctx => new ViewDescriptorWrapper(ctx.descriptor) };
  }

  getDebugName() {
    return 'rnoh';
  }
}


class CoreUITurboModulesFactory extends UITurboModuleFactory {
  private eagerTurboModuleByName: Map<string, UITurboModule> = new Map();
  private turboModuleFactoryByName =
    (new Map<string, ((ctx: UITurboModuleContext) => UITurboModule)>())
      .set(AccessibilityManagerTurboModule.NAME, (ctx) => new AccessibilityManagerTurboModule(ctx))
      .set(AlertManagerTurboModule.NAME, (ctx) => new AlertManagerTurboModule(ctx))
      .set(AppStateTurboModule.NAME, (ctx) => new AppStateTurboModule(ctx))
      .set(BlobTurboModule.NAME, (ctx) => new BlobTurboModule(ctx))
      .set(DeviceEventManagerTurboModule.NAME, (ctx) => new DeviceEventManagerTurboModule(ctx))
      .set(DevSettingsTurboModule.NAME, (ctx) => new DevSettingsTurboModule(ctx))
      .set(DevMenuTurboModule.NAME, (ctx) => new DevMenuTurboModule(ctx))
      .set(ExceptionsManagerTurboModule.NAME, (ctx) => new ExceptionsManagerTurboModule(ctx))
      .set(FileReaderTurboModule.NAME, (ctx) => new FileReaderTurboModule(ctx))
      .set(ImageLoaderTurboModule.NAME, (ctx) => new ImageLoaderTurboModule(ctx))
      .set(KeyboardObserverTurboModule.NAME, (ctx) => new KeyboardObserverTurboModule(ctx))
      .set(NativeAnimatedTurboModule.NAME, (ctx) => new NativeAnimatedTurboModule(ctx))
      .set(LinkingManagerTurboModule.NAME, (ctx) => new LinkingManagerTurboModule(ctx))
      .set(NetworkingTurboModule.NAME, (ctx) => new NetworkingTurboModule(ctx))
      .set(PlatformColorTurboModule.NAME, (ctx) => new PlatformColorTurboModule(ctx))
      .set(PlatformConstantsTurboModule.NAME, (ctx) => new PlatformConstantsTurboModule(ctx))
      .set(ShareTurboModule.NAME, (ctx) => new ShareTurboModule(ctx))
      .set(SourceCodeTurboModule.NAME, (ctx) => new SourceCodeTurboModule(ctx))
      .set(TimingTurboModule.NAME, (ctx) => new TimingTurboModule(ctx))
      .set(WebSocketTurboModule.NAME, (ctx) => new WebSocketTurboModule(ctx))
      .set(I18nManagerTurboModule.NAME, (ctx) => new I18nManagerTurboModule(ctx))
      .set(LogBoxTurboModule.NAME, (ctx) => new LogBoxTurboModule(ctx))
      .set(DevLoadingViewTurboModule.NAME, (ctx) => new DevLoadingViewTurboModule(ctx))
      .set(VibrationTurboModule.NAME, (ctx) => new VibrationTurboModule(ctx))
      .set(ToastAndroidTurboModule.NAME, (ctx) => new ToastAndroidTurboModule(ctx))

  async prepareEagerTurboModules() {
    const statusBarTurboModule = new StatusBarTurboModule(this.ctx);
    this.eagerTurboModuleByName.set(SafeAreaTurboModule.NAME, await SafeAreaTurboModule.create(
      this.ctx,
      statusBarTurboModule,
    ))
    this.eagerTurboModuleByName.set(StatusBarTurboModule.NAME, statusBarTurboModule)
    this.eagerTurboModuleByName.set(DeviceInfoTurboModule.NAME, await DeviceInfoTurboModule.create(this.ctx))
  }

  createTurboModule(name: string): UITurboModule | null {
    const logger = this.ctx.logger.clone(["CoreUITurboModulesFactory", "createTurboModule"])
    logger.info(`Creating ${name} TurboModule`)
    if (!this.hasTurboModule(name)) {
      logger.info(`Couldn't create ${name} TurboModule`)
      return null
    }
    if (this.eagerTurboModuleByName.has(name)) {
      return this.eagerTurboModuleByName.get(name)!;
    }
    return this.turboModuleFactoryByName.get(name)!(this.ctx);
  }

  hasTurboModule(name: string): boolean {
    return (
      this.turboModuleFactoryByName.has(name) || this.eagerTurboModuleByName.has(name)
    );
  }
}


class CoreWorkerTurboModulesFactory extends WorkerTurboModuleFactory {
  private turboModuleFactoryByName = new Map<string, ((ctx: WorkerTurboModuleContext) => WorkerTurboModule)>()
    .set(ImageLoaderWorkerTurboModule.NAME, (ctx) => new ImageLoaderWorkerTurboModule(ctx))
    .set(AppearanceWorkerTurboModule.NAME, (ctx) => new AppearanceWorkerTurboModule(ctx))

  createTurboModule(name: string): WorkerTurboModule | null {
    const logger = this.ctx.logger.clone(["CoreWorkerTurboModulesFactory", "createTurboModule"])
    logger.info(`Creating ${name} TurboModule`)
    if (!this.hasTurboModule(name)) {
      return null;
    }
    return this.turboModuleFactoryByName.get(name)!(this.ctx);
  }

  hasTurboModule(name: string): boolean {
    if (this.ctx.rnInstance.getArchitecture() === "ARK_TS" && name == ImageLoaderWorkerTurboModule.NAME) {
      // fallback to UI version of ImageLoaderTurboModule in ArkTS architecture because RNImage uses it
      return false;
    }
    return this.turboModuleFactoryByName.has(name);
  }
}


