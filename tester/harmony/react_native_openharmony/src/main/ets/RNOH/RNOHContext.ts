import { RNInstanceImpl } from "./RNInstance"
import { RNOHError } from "./RNOHError"
import type common from '@ohos.app.ability.common'
import type { DescriptorRegistry } from './DescriptorRegistry';
import type { RNComponentCommandReceiver } from './RNComponentCommandHub';
import type { RNInstance } from './RNInstance';
import type { ComponentManagerRegistry } from './ComponentManagerRegistry';
import type { HttpClient } from '../HttpClient/HttpClient';
import type { RNOHLogger } from "./RNOHLogger"
import type { WorkerRNInstance } from "./WorkerRNInstance"
import type { DevMenu } from './DevMenu'
import type { DevToolsController } from './DevToolsController'
import type { DisplayMetrics } from './types'
import type { RNInstanceRegistry } from './RNInstanceRegistry'
import type { RNInstanceOptions } from './RNInstance'
import type { SafeAreaInsetsProvider } from './SafeAreaInsetsProvider'


export type UIAbilityState = "FOREGROUND" | "BACKGROUND"

type RNOHCoreContextDependencies = {
  reactNativeVersion: string,
  rnInstanceRegistry: RNInstanceRegistry;
  displayMetricsProvider: () => DisplayMetrics;
  uiAbilityStateProvider: () => UIAbilityState;
  logger: RNOHLogger;
  uiAbilityContext: common.UIAbilityContext;
  isDebugModeEnabled: boolean;
  defaultBackPressHandler: () => void;
  devToolsController: DevToolsController;
  devMenu: DevMenu;
  safeAreaInsetsProvider: SafeAreaInsetsProvider
  launchUri?: string;
};

/**
 * @thread: MAIN
 * Provides dependencies and utilities shareable across RNInstances. Also includes methods for creating and destroying
 * RNInstances. For utilities or dependencies specific to an RNInstance, refer to RNOHContext.
 */
export class RNOHCoreContext {
  /**
   * @internal
   */
  constructor(public __rnohCoreContextDeps__: RNOHCoreContextDependencies) {
  }

  get reactNativeVersion() {
    return this.__rnohCoreContextDeps__.reactNativeVersion
  }

  public reportRNOHError(rnohError: RNOHError) {
    this.devToolsController.setLastError(rnohError)
    this.devToolsController.eventEmitter.emit("NEW_ERROR", rnohError)
  }

  async createAndRegisterRNInstance(options: RNInstanceOptions): Promise<RNInstance> {
    const stopTracing = this.__rnohCoreContextDeps__.logger.clone("createAndRegisterRNInstance").startTracing();
    const result = await this.__rnohCoreContextDeps__.rnInstanceRegistry.createInstance(options);
    stopTracing();
    return result;
  }

  async destroyAndUnregisterRNInstance(rnInstance: RNInstance): Promise<void> {
    const stopTracing = this.__rnohCoreContextDeps__.logger.clone("destroyAndUnregisterRNInstance").startTracing();
    if (rnInstance instanceof RNInstanceImpl) {
      rnInstance.onDestroy();
    }
    await this.__rnohCoreContextDeps__.rnInstanceRegistry.deleteInstance(rnInstance.getId());
    stopTracing();
  }

  getDisplayMetrics(): DisplayMetrics {
    return this.__rnohCoreContextDeps__.displayMetricsProvider();
  }

  getUIAbilityState(): UIAbilityState {
    return this.__rnohCoreContextDeps__.uiAbilityStateProvider();
  }

  dispatchBackPress(): void {
    this.__rnohCoreContextDeps__.rnInstanceRegistry.forEach(rnInstance => rnInstance.onBackPress());
  }

  /**
   * @deprecated - This function shouldn't be in RNOHCoreContext because readiness is relative to a RNInstance and this context is shared across instances.
   * @depreciationDate 2024-04-08
   */
  markReadiness(): void {
  }

  cancelTouches(): void {
    this.__rnohCoreContextDeps__.rnInstanceRegistry.forEach((rnInstance) => {
      rnInstance.cancelTouches();
    });
  }

  get logger(): RNOHLogger {
    return this.__rnohCoreContextDeps__.logger;
  }

  get uiAbilityContext(): common.UIAbilityContext {
    return this.__rnohCoreContextDeps__.uiAbilityContext;
  }

  get isDebugModeEnabled(): boolean {
    return this.__rnohCoreContextDeps__.isDebugModeEnabled;
  }

  get launchUri(): string | undefined {
    return this.__rnohCoreContextDeps__.launchUri;
  }

  get devToolsController(): DevToolsController {
    return this.__rnohCoreContextDeps__.devToolsController!;
  }

  get devMenu(): DevMenu {
    return this.__rnohCoreContextDeps__.devMenu!;
  }

  get defaultBackPressHandler(): () => void {
    return this.__rnohCoreContextDeps__.defaultBackPressHandler;
  }

  get safeAreaInsetsProvider() {
    return this.__rnohCoreContextDeps__.safeAreaInsetsProvider;
  }
}

type RNOHContextDependencies = {
  rnInstance: RNInstance,
  rnohCoreContextDependencies: RNOHCoreContextDependencies,
}

/**
 * @thread: MAIN
 * Provides dependencies and utility functions in context of RNInstance.
 */
export class RNOHContext extends RNOHCoreContext {
  /**
   * @internal
   */
  static fromRNOHCoreContext(rnohCoreContext: RNOHCoreContext, rnInstance: RNInstance) {
    return new RNOHContext({
      rnohCoreContextDependencies: rnohCoreContext.__rnohCoreContextDeps__,
      rnInstance: rnInstance,
    })
  }

  protected constructor(
    public __rnohContextDeps__: RNOHContextDependencies,
  ) {
    super(
      __rnohContextDeps__.rnohCoreContextDependencies
    )
  }

  protected get rnInstanceImpl() {
    return this.__rnohContextDeps__.rnInstance as RNInstanceImpl
  }


  /**
   * Check DescriptorRegistry documentation for more information.
   */
  get descriptorRegistry(): DescriptorRegistry {
    return this.rnInstanceImpl.descriptorRegistry;
  }

  /**
   * Check RNComponentCommandReceiver documentation for more information.
   */
  get componentCommandReceiver(): RNComponentCommandReceiver {
    return this.rnInstanceImpl.componentCommandHub;
  }

  /**
   * Check ComponentManagerRegistry documentation for more information.
   */
  get componentManagerRegistry(): ComponentManagerRegistry {
    return this.rnInstanceImpl.componentManagerRegistry;
  }

  /**
   * Check RNInstance documentation for more information.
   */
  get rnInstance(): RNInstance {
    return this.rnInstanceImpl
  }

  /**
   * Check RNInstance::httpClient documentation
   * @returns
   */
  get httpClient(): HttpClient {
    return this.rnInstance.httpClient;
  }

  /**
   * Invoked by React Native when the React application doesn't want to handle the device back press. This method may be relocated in the future.
   */
  invokeDefaultBackPressHandler() {
    if (this.rnInstanceImpl.backPressHandler) {
      this.rnInstanceImpl.backPressHandler();
    } else {
      this.__rnohCoreContextDeps__.defaultBackPressHandler();
    }
  }
}

/**
 * @api
 */
export class UITurboModuleContext extends RNOHContext {
}

/**
 * @api
 * @deprecated: Use UITurboModuleContext or WorkerTurboModuleContext instead (latestRNOHVersion: 0.72.30)
 */
export class TurboModuleContext extends UITurboModuleContext {
}

/**
 * @internal
 */
export type WorkerTurboModuleContextDependencies = {
  logger: RNOHLogger
  uiAbilityContext: common.UIAbilityContext
  rnInstance: WorkerRNInstance
}

/**
 * @api
 */
export class WorkerTurboModuleContext {
  /**
   * @internal
   */
  constructor(public __workerTurboModuleContextDeps__: WorkerTurboModuleContextDependencies) {
  }

  get logger() {
    return this.__workerTurboModuleContextDeps__.logger
  }

  get uiAbilityContext() {
    return this.__workerTurboModuleContextDeps__.uiAbilityContext
  }

  get rnInstance() {
    return this.__workerTurboModuleContextDeps__.rnInstance
  }
}

