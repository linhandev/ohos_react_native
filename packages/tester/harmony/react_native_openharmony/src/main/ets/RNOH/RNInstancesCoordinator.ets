/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type common from '@ohos.app.ability.common'
import window from '@ohos.window';
import { RNOHLogger } from "./RNOHLogger"
import { NapiBridge } from './NapiBridge';
import { RNInstanceRegistry } from "./RNInstanceRegistry"
import { RNOHContext, RNOHCoreContext, InternalRNOHCoreContext } from "./RNOHContext"
import { DisplayMetricsManager } from './DisplayMetricsManager';
import { JSPackagerClient } from "./JSPackagerClient"
import { InternalDevToolsController } from "./DevToolsController"
import { DevMenu, InternalDevMenu, NoopDevMenu } from "./DevMenu"
import { JSPackagerClientConfig } from "./JSPackagerClient"
import { RNOHError, RNOHErrorEventEmitter } from "./RNOHError"
import AbilityConfiguration from '@ohos.app.ability.Configuration';
import { HttpClient, DefaultHttpClient } from "../HttpClient"
import { AbilityConstant, Want } from '@kit.AbilityKit';
import { WorkerThread } from "./WorkerThread"
import { SafeAreaInsetsProvider } from './SafeAreaInsetsProvider';
import { bundleManager } from '@kit.AbilityKit';
import { EventEmitter } from './EventEmitter';
import { WorkerTaskRunner } from './WorkerTaskRunner';
import { EtsUITurboModuleContext } from './EtsRNOHContext';
import { RNSettingDialog } from './RNSettingDialog';
import { JSEngineName } from './types';

/**
 * This interface allows providing dependencies in any order.
 * This is useful when some dependency is deprecated, made optional and later removed since such operation doesn't
 * create a breaking change.
 */
export interface RNInstancesCoordinatorDependencies {
  /**
   * @deprecated
   */
  fontSizeScale?: number,
  logger: RNOHLogger,
  uiAbilityContext: common.UIAbilityContext,
  rnohWorkerScriptUrl?: string,

  /**
   * invoked when the React application doesn't want to handle the device back press
   */
  defaultBackPressHandler: () => void
}

export type BuildMode = "DEBUG" | "RELEASE"

export interface RNInstancesCoordinatorOptions {
  launchURI?: string
  onGetPackagerClientConfig?: (buildMode: BuildMode) => JSPackagerClientConfig | undefined
  defaultHttpClient?: HttpClient
  /**
   * Set to `true` (in each UIAbility), if your app bundle provides multiple UIAbilities that use RNOH.
   */
  disableCleaningRNInstances?: boolean,
}

const RNOH_BANNER = '\n\n\n' +
  '██████╗ ███╗   ██╗ ██████╗ ██╗  ██╗' + '\n' +
  '██╔══██╗████╗  ██║██╔═══██╗██║  ██║' + '\n' +
  '██████╔╝██╔██╗ ██║██║   ██║███████║' + '\n' +
  '██╔══██╗██║╚██╗██║██║   ██║██╔══██║' + '\n' +
  '██║  ██║██║ ╚████║╚██████╔╝██║  ██║' + '\n' +
  '╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝' + '\n\n' +
  "█____ — MAIN" + "\n" +
  "_█___ — BACKGROUND" + "\n" +
  "__█__ — JS" + "\n" +
  "___█_ — WORKER" + "\n" +
  "____█ — CLEANUP" + "\n==================\n"

type AppState = "FOREGROUND" | "BACKGROUND"

function getMetadata(name: string): string {
  let bundleFlags = bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_METADATA |
  bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION;
  let metadataArray = bundleManager.getBundleInfoForSelfSync(bundleFlags).appInfo.metadataArray;
  let finalMetadata = '';
  metadataArray.forEach(moduleMetadata => {
    moduleMetadata.metadata.forEach(metadata => {
      if (metadata.name == name) {
        finalMetadata = metadata.value
        return;
      }
    });
  });
  return finalMetadata;
}

/**
 * Bootstraps React Native and forwards device events to RNInstances. This class is created for UIAbility's usage.
 * Use this class if RNAbility is too limiting for your use case, and adapting code to breaking changes is not a big deal in your project.
 */
export class RNInstancesCoordinator {
  private static isInitialized = false

  static create(dependencies: RNInstancesCoordinatorDependencies,
    options?: RNInstancesCoordinatorOptions): RNInstancesCoordinator {
    if (RNInstancesCoordinator.isInitialized) {
      dependencies.logger.fatal(new RNOHError({
        whatHappened: "RNInstancesCoordinator was already created",
        howCanItBeFixed: ["Change your code to call RNInstancesCoordinator.create only once"]
      }))
    }
    RNInstancesCoordinator.isInitialized = true
    dependencies.logger.info(RNOH_BANNER)
    const onDestroyCallbacks: Function[] = []
    const devToolsController = new InternalDevToolsController(dependencies.logger);
    const napiBridge = new NapiBridge(dependencies.logger);
    const displayMetricsManager = new DisplayMetricsManager(dependencies.logger);
    displayMetricsManager.updateConfiguration(dependencies.uiAbilityContext.config);
    const globalRNOHErrorEventEmitter: RNOHErrorEventEmitter = new EventEmitter();
    globalRNOHErrorEventEmitter.subscribe("NEW_ERROR", (err) => {
      dependencies.logger.error(err);
      devToolsController.setLastError(err);
      devToolsController.eventEmitter.emit("NEW_ERROR", err);
    })
    const envInfo =
      napiBridge.onInit(options?.disableCleaningRNInstances !== undefined ? !options.disableCleaningRNInstances : true,
        {
          handleError: (rnohError) => {
            globalRNOHErrorEventEmitter.emit("NEW_ERROR", rnohError)
          },
          getDisplayMetrics: () => displayMetricsManager.getDisplayMetrics(),
          getMetadata,
        });

    let devMenu: DevMenu = new NoopDevMenu()
    // NOTE: only initialize DevMenu in debug mode
    if (envInfo.isDebugModeEnabled) {
      const internalDevMenu =
        new InternalDevMenu(devToolsController, new RNSettingDialog(), dependencies.uiAbilityContext, dependencies.logger);
      onDestroyCallbacks.push(() => {
        internalDevMenu.onDestroy()
      })
      devMenu = internalDevMenu;
    }

    const jsPackagerClient = new JSPackagerClient(
      dependencies.logger,
      devToolsController,
      devMenu
    )
    const jsPackagerClientConfig =
      options?.onGetPackagerClientConfig?.(envInfo.isDebugModeEnabled ? "DEBUG" : "RELEASE")
    if (jsPackagerClientConfig) {
      jsPackagerClient.connectToMetroMessages(jsPackagerClientConfig);
    }
    return new RNInstancesCoordinator(napiBridge,
      dependencies.logger,
      displayMetricsManager,
      envInfo.isDebugModeEnabled,
      envInfo.jsEngineName,
      envInfo.envId,
      dependencies.uiAbilityContext,
      devToolsController,
      devMenu,
      jsPackagerClient,
      dependencies.defaultBackPressHandler,
      globalRNOHErrorEventEmitter,
      dependencies.rnohWorkerScriptUrl,
      options,
      onDestroyCallbacks);
  }

  private rawLogger: RNOHLogger;
  private logger: RNOHLogger;
  private rnInstanceRegistry: RNInstanceRegistry
  private rnohCoreContext: InternalRNOHCoreContext;
  private napiBridge: NapiBridge;
  private displayMetricsManager: DisplayMetricsManager;
  private isDebugModeEnabled: boolean
  private jsEngineName: JSEngineName
  private uiAbilityContext: common.UIAbilityContext
  private devToolsController: InternalDevToolsController
  private devMenu: DevMenu
  private jsPackagerClient: JSPackagerClient
  private options: RNInstancesCoordinatorOptions | undefined
  private appState: AppState = "FOREGROUND"
  private defaultBackPressHandler: () => void
  private globalRNOHErrorEventEmitter: RNOHErrorEventEmitter
  private envId: number;
  private workerTaskRunner: WorkerTaskRunner
  private onDestroyCallbacks: Function[]

  private constructor(napiBridge: NapiBridge,
    logger: RNOHLogger,
    displayMetricsManager: DisplayMetricsManager,
    isDebugModeEnabled: boolean,
    jsEngineName: JSEngineName,
    envId: number,
    uiAbilityContext: common.UIAbilityContext,
    devToolsController: InternalDevToolsController,
    devMenu: DevMenu,
    jsPackagerClient: JSPackagerClient,
    defaultBackPressHandler: () => void,
    globalRNOHErrorEventEmitter: RNOHErrorEventEmitter,
    rnohWorkerScriptUrl?: string | undefined,
    options?: RNInstancesCoordinatorOptions,
    onDestoryCallbacks?: Function[]) {
    this.envId = envId;
    this.logger = logger.clone("RNInstancesCoordinator")
    this.rawLogger = logger
    this.napiBridge = napiBridge
    this.displayMetricsManager = displayMetricsManager;
    this.isDebugModeEnabled = isDebugModeEnabled;
    this.jsEngineName = jsEngineName;
    this.uiAbilityContext = uiAbilityContext;
    this.devToolsController = devToolsController;
    this.devMenu = devMenu;
    this.options = options;
    this.jsPackagerClient = jsPackagerClient;
    this.defaultBackPressHandler = defaultBackPressHandler;
    this.globalRNOHErrorEventEmitter = globalRNOHErrorEventEmitter;
    const workerThreadPromise = rnohWorkerScriptUrl !== undefined ? WorkerThread.create({
      scriptUrl: rnohWorkerScriptUrl,
      name: "RNOHWorker",
      logger: logger,
      onWorkerError: (rnohError) => {
        this.rnohCoreContext.reportRNOHError(rnohError);
      }
    }) : undefined
    this.workerTaskRunner = new WorkerTaskRunner(workerThreadPromise)

    this.rnInstanceRegistry = new RNInstanceRegistry(
      uiAbilityContext,
      this.envId,
      this.isDebugModeEnabled,
      this.jsEngineName,
      this.rawLogger,
      this.globalRNOHErrorEventEmitter,
      napiBridge,
      this.devToolsController,
      (rnInstance) => new EtsUITurboModuleContext({
        rnohContext: RNOHContext.fromCoreContext(this.rnohCoreContext, rnInstance)
      }),
      options?.defaultHttpClient ?? new DefaultHttpClient(),
      this.uiAbilityContext.resourceManager,
      workerThreadPromise
    )
    this.rnohCoreContext = new InternalRNOHCoreContext({
      reactNativeVersion: "0.77.1",
      safeAreaInsetsProvider: new SafeAreaInsetsProvider(uiAbilityContext),
      logger: this.rawLogger,
      uiAbilityContext: this.uiAbilityContext,
      isDebugModeEnabled: this.isDebugModeEnabled,
      jsEngineName: this.jsEngineName,
      rnInstanceRegistry: this.rnInstanceRegistry,
      displayMetricsProvider: () => this.displayMetricsManager.getDisplayMetrics(),
      uiAbilityStateProvider: () => this.appState,
      launchUri: this.options?.launchURI,
      defaultBackPressHandler: this.defaultBackPressHandler,
      devToolsController: this.devToolsController,
      devMenu: this.devMenu,
      rnohErrorEventEmitter: this.globalRNOHErrorEventEmitter,
      erasedWorkerTaskRunner: this.workerTaskRunner,
      napiBridge: napiBridge
    });
    this.onDestroyCallbacks = onDestoryCallbacks ?? []
  }

  public onDestroy() {
    const stopTracing = this.logger.clone("onDestroy").startTracing()
    this.jsPackagerClient.onDestroy()
    this.rnInstanceRegistry.forEach(instance => {
      instance.onDestroy()
    })
    this.workerTaskRunner.onDestroy()
    this.rnohCoreContext.onDestroy()
    this.onDestroyCallbacks.forEach(cb => {
      cb()
    });
    stopTracing()
  }

  public getBuildMode(): BuildMode {
    return this.isDebugModeEnabled ? "DEBUG" : "RELEASE"
  }

  public getRNOHCoreContext(): RNOHCoreContext {
    return this.rnohCoreContext
  }

  public onForeground() {
    this.setAppState("FOREGROUND")
    this.rnInstanceRegistry.forEach(instance => {
      instance.onForeground()
    })
  }

  private setAppState(appState: AppState) {

    this.appState = appState
  }

  public onBackground() {
    this.setAppState("BACKGROUND")
    this.rnInstanceRegistry.forEach(instance => {
      instance.onBackground()
    })
  }

  public onWindowStageChange(windowStageEvent: window.WindowStageEventType) {
    this.rnInstanceRegistry.forEach((rnInstance) => {
      rnInstance.onWindowStageChange(windowStageEvent)
    })
  }

  public onWindowRectChange(data: window.RectChangeOptions) {
    if (data.reason === window.RectChangeReason.DRAG_START) {
      this.rnInstanceRegistry.forEach((rnInstance) => {
        rnInstance.onWindowReactChange(true)
      })
    } else if(data.reason === window.RectChangeReason.DRAG_END) {
      this.rnInstanceRegistry.forEach((rnInstance) => {
        rnInstance.onWindowReactChange(false)
      })
    }
  }

  public onWindowSizeChange(windowSize: window.Size) {
    this.displayMetricsManager.updateWindowSize(windowSize);
    this.rnInstanceRegistry.forEach((rnInstance) => {
      rnInstance.onWindowSizeChange(windowSize)
    })
  }

  public onConfigurationUpdate(systemConfiguration: AbilityConfiguration.Configuration) {
    this.displayMetricsManager?.updateConfiguration(systemConfiguration);
    this.rnInstanceRegistry?.forEach((rnInstance): void => rnInstance.onConfigurationUpdate(systemConfiguration))
  }

  public onMemoryLevel(memoryLevel: number) {
    const MEMORY_LEVEL_NAMES = ["MEMORY_LEVEL_MODERATE", "MEMORY_LEVEL_LOW", "MEMORY_LEVEL_CRITICAL"]
    this.logger.debug("Received memory level event: " + MEMORY_LEVEL_NAMES[memoryLevel])
    this.napiBridge.onMemoryLevel(memoryLevel);
  }

  public onNewWant(want: Want, launchParam: AbilityConstant.LaunchParam) {
    this.rnInstanceRegistry?.forEach((rnInstance) => {
      rnInstance.onNewWant(want.uri);
    })
  }
}
