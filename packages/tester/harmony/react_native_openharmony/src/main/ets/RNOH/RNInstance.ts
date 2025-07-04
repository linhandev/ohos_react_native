/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type UIAbility from '@ohos.app.ability.UIAbility'
import { UIContext } from '@kit.ArkUI'
import { RNComponentCommandHub } from './RNComponentCommandHub'
import { DescriptorRegistry, DescriptorWrapperFactory } from './DescriptorRegistry'
import { ComponentManagerRegistry } from './ComponentManagerRegistry'
import { SurfaceHandle } from './SurfaceHandle'
import { TurboModuleProvider } from './TurboModuleProvider'
import { EventEmitter, EventEmitterOptions } from './EventEmitter'
import type { RNOHLogger } from './RNOHLogger'
import type { CppFeatureFlag, NapiBridge } from './NapiBridge'
import type { UITurboModuleContext } from './RNOHContext'
import type { JSBundleProvider } from './JSBundleProvider'
import { JSBundleProviderError } from './JSBundleProvider'
import type { Tag } from './DescriptorBase'
import type { AnyThreadTurboModuleFactory, RNPackage, RNPackageContext, UITurboModuleFactory } from './RNPackage'
import type { AnyThreadTurboModule, UITurboModule } from './TurboModule'
import { ResponderLockDispatcher } from './ResponderLockDispatcher'
import { DevToolsController } from './DevToolsController'
import { RNInstanceError, RNInstanceErrorEventEmitter, RNOHError, RNOHErrorEventEmitter } from './RNOHError'
import window from '@ohos.window'
import { DevServerHelper } from './DevServerHelper'
import { HttpClient } from '../HttpClient/HttpClient'
import resourceManager from '@ohos.resourceManager'
import { WorkerThread } from "./WorkerThread"
import font from "@ohos.font"
import { RNOHMarker, RNOHMarkerEventPayload } from './RNOHMarker'
import { JSEngineName } from './types'


export type Resource = Exclude<font.FontOptions['familySrc'], string>;

/**
 * TouchEvent is globally available in *.ets files but can't be imported in *.ts.
 */
type TouchEvent = unknown

export type SurfaceContext = {
  width: number
  height: number
  surfaceOffsetX: number
  surfaceOffsetY: number
  pixelRatio: number
  isRTL: boolean
} | {
  minWidth: number
  minHeight: number
  maxWidth: number
  maxHeight: number
  surfaceOffsetX: number
  surfaceOffsetY: number
  pixelRatio: number
  isRTL: boolean
}

export enum LifecycleState {
  BEFORE_CREATE,
  PAUSED,
  READY,
}

export type LifecycleEventArgsByEventName = {
  CONFIGURATION_UPDATE: Parameters<UIAbility['onConfigurationUpdate']>;
  FOREGROUND: [];
  BACKGROUND: [];
  JS_BUNDLE_EXECUTION_FINISH: [
    {
      jsBundleUrl: string;
      appKeys: string[];
    },
  ];
  RELOAD: [{ reason: string | undefined }];
  WINDOW_SIZE_CHANGE: [windowSize: window.Size];
  WINDOW_RECT_DRAG: [isWindowRectDrag: boolean];
};

export type StageChangeEventArgsByEventName = {
  APP_STATE_FOCUS: [];
  APP_STATE_BLUR: [];
};

export type BundleExecutionStatus = 'RUNNING' | 'DONE';

const rootDescriptor = {
  isDynamicBinder: false,
  type: 'RootView',
  tag: 1,
  childrenTags: [],
  rawProps: {},
  props: {},
  state: {},
  layoutMetrics: {
    frame: {
      origin: {
        x: 0,
        y: 0,
      },
      size: {
        width: 0,
        height: 0,
      },
    },
  },
};

type FeatureFlagName =
  | 'ENABLE_RN_INSTANCE_CLEAN_UP'
  | 'IMAGE_LOADER'
  | 'C_API_ARCH';

/**
 * Coordinates information flow by passing information to other objects to facilitate their operations.
 * Each RNInstance has its own JavaScript environment. A single application can utilize multiple RNInstances.
 */
export interface RNInstance {
  /**
   * Check DescriptorRegistry documentation for more information.
   */
  descriptorRegistry: DescriptorRegistry;

  /**
   * @architecture: C-API
   * Relays messages emitted from C++ by RNInstanceCAPI::postMessageToArkTS
   */
  cppEventEmitter: EventEmitter<Record<string, unknown[]>>;

  /**
   * Check ComponentManagerRegistry documentation for more information.
   */
  componentManagerRegistry: ComponentManagerRegistry;

  /**
   * Mindless copy of Android's `ReactInstanceManager::getLifecycleState` per specific request.
   * It probably behaves differently to Android because UIAbility is a different concept than Android's Activity despite
   * certain similarities.
   */
  getLifecycleState(): LifecycleState;

  /**
   * Allows subscribing to various events. Check LifecycleEventArgsByEventName type for more information.
   */
  subscribeToLifecycleEvents: <TEventName extends keyof LifecycleEventArgsByEventName,>(
    eventName: TEventName,
    listener: (...args: LifecycleEventArgsByEventName[TEventName]) => void,
    options?: EventEmitterOptions
  ) => () => void;

  /**
   * Similar to subscribeToLifecycleEvents but handles different set of events. It may be removed to unify subscribing to events.
   */
  subscribeToStageChangeEvents: <TEventName extends keyof StageChangeEventArgsByEventName,>(
    eventName: TEventName,
    listener: (...args: StageChangeEventArgsByEventName[TEventName]) => void,
    options?: EventEmitterOptions
  ) => () => void;

  /**
   * Asynchronously executes a JS function. It may be renamed in the future because "call" suggest synchronous communication.
   * @param moduleName — name of the JavaScript file
   * @param functionName — name of the function defined in module.exports in that JS file
   * @param args - args that function should receive
   */
  callRNFunction(
    moduleName: string,
    functionName: string,
    args: unknown[],
  ): void;

  /**
   * Sends device events (e.g. "appearanceChanged") to React Native.
   */
  emitDeviceEvent(eventName: string, payload: any): void;

  /**
   * Sends component events like "onScroll". That event is received by "EventEmitRequestHandler" on the C++ side. That handler
   * calls proper method on Component's EventEmitter.
   */
  emitComponentEvent(tag: Tag, eventName: string, payload: any): void;

  /**
   * Used by RNApp to avoid loading the same bundle twice.
   */
  getBundleExecutionStatus(
    bundleURL: string,
  ): BundleExecutionStatus | undefined;

  /**
   * Returns a SurfaceHandle that can be used to stop rendering when the RNSurface is not visible.
   */
  getSurfaceHandleByAppKey(appKey: string): SurfaceHandle | undefined

  /**
   * Enables feature flag. It may be removed in the future because usually feature flags need to be provided when creating
   * RNInstance.
   */
  enableFeatureFlag(featureFlagName: FeatureFlagName): void;

  /**
   * Checks if given feature flag is enabled.
   */
  isFeatureFlagEnabled(featureFlagName: FeatureFlagName): boolean;

  /**
   * Reads JS Bundle and executes loaded code.
   */
  runJSBundle(jsBundleProvider: JSBundleProvider): Promise<void>;

  /**
   * Provides TurboModule instance. Currently TurboModule live on UI thread. This method may be deprecated once "Worker" turbo module are supported.
   */
  getTurboModule<T>(name: string): T;

  /**
   * Provides TurboModule instance. Currently TurboModule live on UI thread. This method may be deprecated once "Worker" turbo module are supported.
   */
  getUITurboModule<T extends UITurboModule>(name: string): T;

  /**
   * Used by RNSurface. It creates a surface somewhere in React Native.
   */
  createSurface(appKey: string): SurfaceHandle;

  /**
   * Sets (Right-To-Left) mode in all surfaces.
   */
  updateRTL(isRTL: boolean): void;

  /**
   * Sends state update request to ComponentNapiBinder.h::updateState to update the state on C++ side.
   */
  updateState(componentName: string, tag: Tag, state: unknown): void;

  /**
   * @returns RNInstance ID. ID is internally to differentiate between RNInstance version.
   */
  getId(): number;

  /**
   * @returns RNInstance name. Name allows RN App developers to differentiate between RNInstances.
   */
  getName(): string | undefined;

  /**
   * This method can be used to replace a core component with a custom one.
   * @param descriptorType - type of the descriptor
   * @param componentName - value to be provided in ComponentBuilderContext for given `descriptorType`
   */
  bindComponentNameToDescriptorType(
    componentName: string,
    descriptorType: string,
  );

  /**
   * Internal method related to bindComponentNameToDescriptorType.
   */
  getComponentNameFromDescriptorType(descriptorType: string): string;

  /**
   * @architecture: ArkTS
   * Blocks gestures in targetComponent and its ancestors. Used by react-native-gesture-handler when panning in
   * RNScrollView or other scrollable components.
   * @returns a function that cancels this this effect
   */
  blockComponentsGestures(targetComponentTag: Tag): () => void;

  /**
   * @returns the first loaded JS Bundle URL. This method is used by SourceCodeTurboModule to generate proper stack traces.
   * Some apps split their bundles to improve the start up performance, hence the word "initial".
   */
  getInitialBundleUrl(): string | undefined;

  /**
   * @deprecated (latestRNOHVersion: 0.72.39)
   * @returns current RNOH architecture name
   */
  getArchitecture(): 'C_API' | 'ARK_TS';

  /**
   * (Almost) all network request go through HttpClient which can be used to improve logging or unify request handling
   * in hybrid (JS+Native) applications.
   */
  get httpClient(): HttpClient;

  /**
   * @returns base path specifying where to look for bundled assets
   */
  getAssetsDest(): string;

  /**
   * @architecture: C-API
   * Sends message to C++ side. Handled by ArkTSMessageHub::Observer or ArkTSMessageHandler.
   */
  postMessageToCpp(name: string, payload: any): void;

  /**
   * Subscribes to exceptions in the framework, specific to this instance.
   * @returns A callback to unsubscribe.
   */
  subscribeToRNOHErrors(listener: (err: RNOHError) => void): () => void

  /**
   * @architecture: C-API
   * @internal
   */
  setFrameNodeFactory(frameNodeFactory: FrameNodeFactory | null): void;

  /**
   * @architecture: C-API
   * Native apps can place RNSurface inside a Scroll component. When that Scroll
   * is being scrolled, RN shouldn't recognize swipe gestures as clicks. To
   * achieve this, RN needs to receive a CANCEL event. At the time of creating
   * this method, the platform didn't send the CANCEL touch event, so RNOH
   * provides a way for RN developers to cancel those events manually. They can
   * register an appropriate onScroll callback and call this method.
   */
  cancelTouches(): void;

  /**
   * @architecture: C-API
   * Retrieves the native ArkUI node's `id` attribute for the React component with given tag.
   */
  getNativeNodeIdByTag(tag: Tag): string | undefined;

  /**
   * @returns UIContext
   */
  getUIContext(): UIContext;

  /**
   * Registers a custom font used by the RN application.
   * NOTE: Due to ArkUI limitations, fonts from the application sandbox can only be used by the <Text> component.
   * @param fontFamily name of the font family
   * @param fontResource a `$rawfile` resource or an absolute path to the font file in the application sandbox
   * @example registerFont("Pacifico-Regular", $rawfile("fonts/Pacifico-Regular.ttf")
   * @example registerFont("Pacifico-Regular", "/data/storage/el2/base/files/Pacifico-Regular.ttf")
   */
  registerFont(fontFamily: string, fontResource: Resource | string);

  /**
   * @architecture: C-API
   * Sends an ArkTS `TouchEvent` to a specific `ComponentInstance` identified by the given tag.
   * This is necessary when ArkTS touch events need to be propagated to a component instance—
   * for example, when using ArkTS modal components such as `.bindSheet`.
   *
   * @param rootTouchTargetTag - The tag identifying the root touch target component.
   * @param touchEvent - The touch event to be sent.
   */
  postTouchEventMessageToCpp(
    rootTouchTargetTag: number,
    touchEvent: TouchEvent,
  );
}

/**
 * @actor RNOH_APP
 *
 * Format --name=value
 * Supported options depends on the version of V8 JavaScript engine
 * Call OH_JSVM_GetVMInfo to check the current version
 */
export type JSVMInitOption = string;

/**
 * @actor RNOH_APP
 */
export const JSVM_INIT_OPTIONS_PRESET = {
  DEFAULT: [],
  LOW_MEMORY: ["--incremental-marking-hard-trigger=40", "--min-semi-space-size=1", "--max-semi-space-size=4"],
  HIGH_PERFORMANCE: ["--incremental-marking-hard-trigger=80", "--min-semi-space-size=16", "--max-semi-space-size=16"]
} as const satisfies Record<string, ReadonlyArray<JSVMInitOption>>;

/**
 * @actor RNOH_APP
 *
 * Configuration options used to initialize and customize a React Native instance.
 * This type defines lifecycle behavior, debugging options, architecture settings, and runtime behaviors.
 */
export type RNInstanceOptions = {
  /**
   * Used to identify RNInstance on RNOHWorker thread.
   */
  name?: string;
  /**
   * Creates RNPackages provided by third-party libraries.
   */
  createRNPackages: (ctx: RNPackageContext) => RNPackage[];
  /**
   * @default: false
   * Enables the Hermes debugger. Should be disabled in production environments to avoid performance degradation.
   */
  enableDebugger?: boolean;
  /**
   * @default: false
   * @architecture: C-API
   * When enabled, RNOH will send mutations that affect only Descriptors of custom components implemented on the ArkUI side.
   * If disabled, RNOH will send all mutations to DescriptorRegistry, even if a component is a CppComponentInstance.
   * Enabling this feature flag may improve performance, but it may break some libraries built on top of the ArkTS architecture
   * and that operate on the tree of descriptors.
   */
  disablePartialSyncOfDescriptorRegistryInCAPI?: boolean;
  /**
   * @default: false
   * Disables advanced React 18 features, such as Automatic Batching.
   * Setting this to `true` will revert to the behavior of React 17,
   * where state updates are processed synchronously and separately.
   */
  disableConcurrentRoot?: boolean;
  /**
   * Specifies the path for RN to locate assets. Necessary in production environments where assets are not hosted by the Metro server.
   * Required if using a custom `--assets-dest` with `react-native bundle-harmony`.
   */
  assetsDest?: string;
  /**
   * Specifies the custom backpress handler to be used when RN application does not handle the event itself
   */
  backPressHandler?: () => void;
  /**
   * If not provided, the defaultHttpClient created by `RNAbility::onCreateDefaultHttpClient` will be used.
   */
  httpClient?: HttpClient;
  /**
   * Specifies custom fonts used by RN application.
   * NOTE: Due to ArkUI limitations, fonts from the application sandbox can only be used by the <Text> component.
   * @example {
   *   "Stint-Regular": $rawfile('fonts/Stint-Regular.ttf'),
   *   "Pacifico-Regular": "/data/storage/el2/base/files/Pacifico-Regular.ttf"
   * }
   */
  fontResourceByFontFamily?: Record<string, Resource | string>;
  /**
   * @default: JSVM_INIT_OPTIONS_PRESET.DEFAULT
   * Specifies custom init options used by JSVM. The options has no effect if using Hermes.
   */
  jsvmInitOptions?: ReadonlyArray<JSVMInitOption>;
  /**
   * @architecture: ArkTS
   * Enables text measurement using NDK (C++) interface.
   * The NDK approach is faster and relatively stable, and will become the default in future versions.
   * @deprecated: Do not enable this option.
   */
  enableNDKTextMeasuring?: boolean;
  /**
   * UNSTABLE: Enables an additional BACKGROUND thread for layout calculations. This improves performance
   * but increases the risk of deadlocks and crashes. Usually crashes the app due to "Assertion failed: parser was already assigned" error.
   * @deprecated: Do not enable this option. This feature causes too many problems to justify performance improvements (latestRNOHVersion: 0.72.27)
   */
  enableBackgroundExecutor?: boolean;
  /**
   * Toggles between the ArkTS (older, more stable but slower) and C-API (newer, less stable but faster) architectures.
   * Choose based on preference for stability or performance.
   * @deprecated: Do not enable this option.
   */
  enableCAPIArchitecture?: boolean;
   /**
   * config the ArkTsComponent names to be use
   * @deprecated: Do not enable this option.
   */
  arkTsComponentNames?: Array<string>;
  /**
   * @architecture: ArkTS
   * Manages image loading and caching. When enabled, RNOH takes responsibility; when disabled, it delegates to ArkUI's Image component.
   * Each approach presents issues under different scenarios.
   * @deprecated: Do not enable this option.
   */
  enableImageLoader?: boolean;
};

/**
 * Used in the C-API architecture
 */
export interface FrameNodeFactory {
  create(tag: Tag, componentName: string);
}

export class RNInstanceImpl implements RNInstance {
  private turboModuleProvider: TurboModuleProvider<UITurboModule | AnyThreadTurboModule>;
  private surfaceCounter = 0;
  private lifecycleState: LifecycleState = LifecycleState.BEFORE_CREATE
  private bundleExecutionStatusByBundleURL: Map<string, BundleExecutionStatus> = new Map()
  private rnInstanceErrorEventEmitter: RNInstanceErrorEventEmitter = new EventEmitter();
  public descriptorRegistry: DescriptorRegistry;
  public componentCommandHub: RNComponentCommandHub;
  public componentManagerRegistry: ComponentManagerRegistry;
  public lifecycleEventEmitter =
    new EventEmitter<LifecycleEventArgsByEventName>();
  public stageEventEmitter =
    new EventEmitter<StageChangeEventArgsByEventName>();
  public cppEventEmitter = new EventEmitter<Record<string, unknown[]>>();
  public backPressHandler: () => void | undefined;
  private componentNameByDescriptorType = new Map<string, string>();
  private logger: RNOHLogger;
  private surfaceHandleByAppKey: Map<string, SurfaceHandle> = new Map();
  private responderLockDispatcher: ResponderLockDispatcher;
  private isFeatureFlagEnabledByName = new Map<FeatureFlagName, boolean>();
  private initialBundleUrl: string | undefined = undefined;
  private frameNodeFactoryRef: { frameNodeFactory: FrameNodeFactory | null } = {
    frameNodeFactory: null,
  };
  private unregisterWorkerMessageListener = () => {
  };
  private uiCtx: UIContext;
  private defaultProps: Record<string, any>;
  private packages: RNPackage[] = [];
  private maybeDisconnectDebugger?: (() => void) | undefined = undefined;
  private unregisterDevToolsMessageListeners: (() => void)[] = [];


  constructor(
    private envId: number,
    private isDebugModeEnabled: boolean,
    private jsEngineName: JSEngineName,
    private id: number,
    private name: string | undefined,
    private injectedLogger: RNOHLogger,
    private globalRNOHErrorEventEmitter: RNOHErrorEventEmitter,
    private napiBridge: NapiBridge,
    disableConcurrentRoot: boolean | undefined,
    private devToolsController: DevToolsController,
    private createUITurboModuleContext: (
      rnInstance: RNInstanceImpl,
    ) => UITurboModuleContext,
    private workerThread: WorkerThread | undefined,
    private shouldEnableDebugger: boolean,
    private shouldDisablePartialSyncOfDescriptorRegistryInCAPI: boolean,
    private assetsDest: string,
    private resourceManager: resourceManager.ResourceManager,
    private fontPathByFontFamily: Record<string, string>,
    private _httpClient: HttpClient,
    backPressHandler?: () => void,
    private jsvmInitOptions?: ReadonlyArray<JSVMInitOption>,
  ) {
    this.defaultProps = { concurrentRoot: !disableConcurrentRoot };
    this.logger = injectedLogger.clone('RNInstance');
    this.frameNodeFactoryRef = { frameNodeFactory: null };
    this.backPressHandler = backPressHandler;
    this.onCreate();
  }

  public getArchitecture(): 'C_API' {
    return 'C_API';
  }

  public get httpClient() {
    return this._httpClient;
  }

  public getAssetsDest(): string {
    return this.assetsDest;
  }

  public onCreate() {
    this.componentManagerRegistry = new ComponentManagerRegistry(
      this.injectedLogger,
    );
    this.componentCommandHub = new RNComponentCommandHub();
    this.responderLockDispatcher = new ResponderLockDispatcher(
      this.componentManagerRegistry,
      this.componentCommandHub,
      this.injectedLogger,
    );
    this.subscribeToDevTools();
    this.registerRNOHMarker();
  }

  public async onDestroy(shouldTryDisconnectingDebugger: boolean = true) {
    const stopTracing = this.logger.clone('onDestroy').startTracing();
    this.unregisterWorkerMessageListener();
    for (const surfaceHandle of this.surfaceHandleByAppKey.values()) {
      if (surfaceHandle.isRunning()) {
        this.logger.warn(
          'Destroying instance with running surface with tag: ' +
          surfaceHandle.getTag(),
        );
        await surfaceHandle.stop();
      }
      surfaceHandle.destroy();
    }
    this.napiBridge.onDestroyRNInstance(this.id);
    this.turboModuleProvider.onDestroy();
    if (shouldTryDisconnectingDebugger) {
      this.maybeDisconnectDebugger?.();
    }
    this.unregisterDevToolsMessageListeners.forEach(cleanUp => cleanUp());
    stopTracing();
  }

  public getId(): number {
    return this.id;
  }

  public getName() {
    return this.name;
  }

  getSurfaceHandleByAppKey(appKey: string): SurfaceHandle | undefined {
    return this.surfaceHandleByAppKey.get(appKey);
  }

  enableFeatureFlag(featureFlagName: FeatureFlagName): void {
    this.isFeatureFlagEnabledByName.set(featureFlagName, true);
  }

  isFeatureFlagEnabled(featureFlagName: FeatureFlagName): boolean {
    return this.isFeatureFlagEnabledByName.get(featureFlagName) ?? false;
  }

  getPackages() {
    return this.packages;
  }


  public async initialize(packages: RNPackage[]) {
    const stopTracing = this.logger.clone('initialize').startTracing();
    this.packages = packages;
    const { descriptorWrapperFactoryByDescriptorType, turboModuleProvider } =
      await this.processPackages(packages);
    this.turboModuleProvider = turboModuleProvider;
    this.descriptorRegistry = new DescriptorRegistry(
      {
        '1': { ...rootDescriptor },
      },
      this.updateState.bind(this),
      this,
      descriptorWrapperFactoryByDescriptorType,
      this.logger,
    );
    const cppFeatureFlags: CppFeatureFlag[] = [];
    if (!this.shouldDisablePartialSyncOfDescriptorRegistryInCAPI) {
      cppFeatureFlags.push('PARTIAL_SYNC_OF_DESCRIPTOR_REGISTRY');
    }
    if (this.workerThread != undefined) {
      cppFeatureFlags.push('WORKER_THREAD_ENABLED');
    }
    this.napiBridge.onCreateRNInstance(
      this.envId,
      this.id,
      this.turboModuleProvider,
      this.frameNodeFactoryRef,
      mutations => {
        try {
          this.descriptorRegistry.applyMutations(mutations);
        } catch (err) {
          if (typeof err === 'string') {
            this.logger.error(err);
          } else if (err instanceof Error) {
            this.logger.error(err.message);
            if (err.stack) {
              this.logger.error(err.stack);
            }
          } else {
            this.logger.error('Unexpected error when applying mutations');
          }
        }
      },
      (tag, commandName, args) => {
        this.componentCommandHub.dispatchCommand(tag, commandName, args);
      },
      (type, payload) => {
        this.onCppMessage(type, payload);
      },
      this.shouldEnableDebugger,
      cppFeatureFlags,
      this.resourceManager,
      this.fontPathByFontFamily,
      this.jsvmInitOptions ?? JSVM_INIT_OPTIONS_PRESET.DEFAULT,
    );
    stopTracing();
  }

  private onCppMessage(type: string, payload: any) {
    try {
      this.cppEventEmitter.emit(type, payload);
      switch (type) {
        case 'SCHEDULER_DID_SET_IS_JS_RESPONDER': {
          if (payload.blockNativeResponder) {
            this.responderLockDispatcher.onBlockResponder(
              payload.tag,
              'REACT_NATIVE',
            );
          } else {
            this.responderLockDispatcher.onUnblockResponder('REACT_NATIVE');
          }
          break;
        }
        case "RNOH_ERROR": {
          this.reportRNOHError(new RNOHError({
            whatHappened: payload.message,
            howCanItBeFixed: [],
            customStack: payload.stack,
            extraData: payload.nested,
          }));
          break;
        }
      }
    } catch (err) {
      this.reportRNOHError(new RNOHError({
        whatHappened: `Failed to handle CPP Message: ${type}`,
        howCanItBeFixed: [],
        extraData: err
      }))
    }
  }

  public blockComponentsGestures(tag: Tag) {
    this.responderLockDispatcher.onBlockResponder(tag, 'EXTERNAL');
    return () => {
      this.responderLockDispatcher.onUnblockResponder('EXTERNAL');
    };
  }

  private async processPackages(packages: RNPackage[]) {
    const logger = this.logger.clone('processPackages');
    const stopTracing = logger.startTracing();
    const turboModuleContext = this.createUITurboModuleContext(this);

    function logPkgTraceName(pkg, idx) {
      const pkgDebugName = pkg.getDebugName();
      let traceName = `package${idx + 1}`;
      if (pkgDebugName) {
        traceName += `: ${pkgDebugName}`;
      }
      return traceName;
    }

    type UIThreadTurboModuleFactory =
      | UITurboModuleFactory
      | AnyThreadTurboModuleFactory;

    const uiThreadTMFactoryPromises: Promise<UIThreadTurboModuleFactory>[] = [
      ...packages.map(async (pkg, idx) => {
        logger
          .clone(logPkgTraceName(pkg, idx))
          .debug('createTurboModulesFactory');
        const turboModuleFactory =
          pkg.createTurboModulesFactory(turboModuleContext);
        await turboModuleFactory.prepareEagerTurboModules();
        return turboModuleFactory;
      }),
      ...packages.map(async (pkg, idx) => {
        logger
          .clone(logPkgTraceName(pkg, idx))
          .debug('createUITurboModuleFactory');
        const turboModuleFactory =
          pkg.createUITurboModuleFactory(turboModuleContext);
        await turboModuleFactory.prepareEagerTurboModules();
        return turboModuleFactory;
      }),
    ];
    if (this.workerThread === undefined) {
      uiThreadTMFactoryPromises.push(
        ...packages.map(async (pkg, idx) => {
          logger
            .clone(logPkgTraceName(pkg, idx))
            .debug('createAnyThreadTurboModuleFactory');
          const turboModuleFactory =
            pkg.createAnyThreadTurboModuleFactory(turboModuleContext);
          await turboModuleFactory?.prepareEagerTurboModules();
          return turboModuleFactory;
        }),
      );
    }

    const result = {
      descriptorWrapperFactoryByDescriptorType: packages.reduce((acc, pkg) => {
        const descriptorWrapperFactoryByDescriptorType =
          pkg.createDescriptorWrapperFactoryByDescriptorType({});
        for (const [descriptorType, descriptorWrapperFactory] of Object.entries(
          descriptorWrapperFactoryByDescriptorType,
        )) {
          acc.set(descriptorType, descriptorWrapperFactory);
        }
        return acc;
      }, new Map<string, DescriptorWrapperFactory>()),
      turboModuleProvider: new TurboModuleProvider<UITurboModule | AnyThreadTurboModule>(
        (await Promise.all(uiThreadTMFactoryPromises)).filter(
          factory => factory != null,
        ),
        this.logger,
      ),
    };
    if (this.workerThread !== undefined) {
      this.unregisterWorkerMessageListener =
        this.workerThread.subscribeToMessages(async (type, payload) => {
          if (type === 'RNOH_TURBO_MODULE_UI_TASK') {
            const task = payload.task;
            if (payload.rnInstanceId !== this.id) {
              return;
            }
            const result = await (task.runnable.run(
              turboModuleContext,
              task.params,
            ) as Promise<any>);
            this.workerThread!.postMessage('RNOH_TURBO_MODULE_UI_TASK_RESULT', {
              result,
              taskId: task.id,
              rnInstanceId: this.id,
            });
          }
        });
    }
    stopTracing();
    return result;
  }

  public subscribeToLifecycleEvents<TEventName extends keyof LifecycleEventArgsByEventName,>(
    type: TEventName,
    listener: (...args: LifecycleEventArgsByEventName[TEventName]) => void,
    options?: EventEmitterOptions
  ) {
    return this.lifecycleEventEmitter.subscribe(type, listener, options);
  }

  public subscribeToStageChangeEvents<TEventName extends keyof StageChangeEventArgsByEventName,>(
    eventName: TEventName,
    listener: (...args: StageChangeEventArgsByEventName[TEventName]) => void,
    options?: EventEmitterOptions
  ): () => void {
    return this.stageEventEmitter.subscribe(eventName, listener, options);
  }

  public getLifecycleState(): LifecycleState {
    return this.lifecycleState;
  }

  public callRNFunction(
    moduleName: string,
    functionName: string,
    args: unknown[],
  ): void {
    if (this.lifecycleState === LifecycleState.BEFORE_CREATE) {
      // wait until the bundle has been loaded before calling the function
      const cancel = this.subscribeToLifecycleEvents(
        'JS_BUNDLE_EXECUTION_FINISH',
        () => {
          this.napiBridge.callRNFunction(
            this.id,
            moduleName,
            functionName,
            args,
          );
          cancel();
        },
      );
      return;
    }
    this.napiBridge.callRNFunction(this.id, moduleName, functionName, args);
  }

  public emitComponentEvent(
    tag: Tag,
    eventEmitRequestHandlerName: string,
    payload: any,
  ) {
    this.napiBridge.emitComponentEvent(
      this.id,
      tag,
      eventEmitRequestHandlerName,
      payload,
    );
  }

  public emitDeviceEvent(eventName: string, params: any) {
    this.callRNFunction('RCTDeviceEventEmitter', 'emit', [eventName, params]);
  }

  public getBundleExecutionStatus(
    bundleURL: string,
  ): BundleExecutionStatus | undefined {
    return this.bundleExecutionStatusByBundleURL.get(bundleURL);
  }

  public async runJSBundle(jsBundleProvider: JSBundleProvider) {
    let bundleURL: string = "";
    const activeBundleUrl = jsBundleProvider.getURL();
    const processedBundleUrls: string[] = [];
    const stopTracing = this.logger.clone('runJSBundle').startTracing();
    const isMetroServer = jsBundleProvider.getHotReloadConfig() !== null;
    try {
      this.devToolsController.eventEmitter.emit(
        'SHOW_DEV_LOADING_VIEW',
        this.id,
        `Loading from ${jsBundleProvider.getHumanFriendlyURL()}...`,
      );
      if (activeBundleUrl) {
        this.bundleExecutionStatusByBundleURL.set(activeBundleUrl, "RUNNING");
      }
      this.logMarker('DOWNLOAD_START');
      const jsBundle = await jsBundleProvider.getBundle(progress => {
        this.devToolsController.eventEmitter.emit(
          'SHOW_DEV_LOADING_VIEW',
          this.id,
          `Loading from ${jsBundleProvider.getHumanFriendlyURL()} (${Math.round(progress * 100)}%)`,
        );
      },(currentProvider) => {
        const currentURL = currentProvider.getURL();
        if (currentURL) {
          bundleURL = currentURL;
          processedBundleUrls.push(currentURL);
          this.bundleExecutionStatusByBundleURL.set(currentURL, "RUNNING");
        }
      });
      this.logMarker('DOWNLOAD_END');
      const bundleURLCur = jsBundleProvider.getURL()
      if(bundleURLCur !== activeBundleUrl && processedBundleUrls.length){
        for(const url of processedBundleUrls){
          this.bundleExecutionStatusByBundleURL.delete(url)
        }
        this.bundleExecutionStatusByBundleURL.set(bundleURL, "RUNNING")
      }else {
        bundleURL = bundleURLCur
      }
      this.initialBundleUrl =
        this.initialBundleUrl ?? bundleURL;

      if (!this.isDebugModeEnabled
        && this.jsEngineName === 'hermes' &&
        !this.initialBundleUrl.endsWith('hbc')
      ) {
        this.logger.warn(
          "It's recommended to use the Hermes Bytecode Compiler (HBC) bundle format when using the Hermes engine. " +
            "Using this can lead to general JS execution performance improvements within your app.",
        );
      }

      await this.napiBridge.loadScript(
        this.id,
        jsBundle,
        this.initialBundleUrl,
      );

      this.lifecycleState = LifecycleState.READY;
      const hotReloadConfig = jsBundleProvider.getHotReloadConfig();
      if (hotReloadConfig) {
        this.callRNFunction('HMRClient', 'setup', [
          'harmony',
          hotReloadConfig.bundleEntry,
          hotReloadConfig.host,
          hotReloadConfig.port,
          true,
        ]);
        this.logger.info('Configured hot reloading');
      }
      const isRemoteBundle = bundleURL.startsWith('http');
      if (this.shouldEnableDebugger && isRemoteBundle) {
        this.maybeDisconnectDebugger = DevServerHelper.connectToDevServer(
          jsBundleProvider.getURL(),
          this.logger,
          this.napiBridge,
          this.getName(),
        );
      }
      this.bundleExecutionStatusByBundleURL.set(bundleURL, 'DONE');
      this.lifecycleEventEmitter.emit('JS_BUNDLE_EXECUTION_FINISH', {
        jsBundleUrl: bundleURL,
        appKeys: jsBundleProvider.getAppKeys(),
      });
      this.workerThread?.postMessage('JS_BUNDLE_EXECUTION_FINISH', {
        rnInstanceId: this.id,
        bundleURL: jsBundleProvider.getURL()
      });
    } catch (err) {
      this.bundleExecutionStatusByBundleURL.delete(bundleURL);
      if (err instanceof JSBundleProviderError) {
        this.reportRNOHError(err)
      } else {
        const suggestions: string[] = [];
        if (isMetroServer) {
          suggestions.push(
            'Please check your Metro Server console. Likely, the error details you need are displayed there.',
          );
        }
        suggestions.push("Please revise your application code. It may contain syntax errors or unhandled exceptions at the top level that could be causing runtime failures.")
        this.reportRNOHError(new RNOHError({
          whatHappened: "Couldn't run a JS bundle",
          howCanItBeFixed: suggestions,
          extraData: err,
        }))
      }
    } finally {
      this.devToolsController.eventEmitter.emit(
        'HIDE_DEV_LOADING_VIEW',
        this.id,
      );
      stopTracing();
    }
  }

  public getTurboModule<T>(name: string): T {
    return this.getUITurboModule<T>(name);
  }

  public getUITurboModule<T>(name: string): T {
    return this.turboModuleProvider.getModule(name) as T;
  }

  public createSurface(appKey: string): SurfaceHandle {
    const stopTracing = this.logger.clone('createSurface').startTracing();
    const tag = this.getNextSurfaceTag();
    const result = new SurfaceHandle(
      this,
      tag,
      appKey,
      this.defaultProps,
      this.napiBridge,
      handle => this.surfaceHandleByAppKey.delete(appKey),
    );
    this.surfaceHandleByAppKey.set(appKey, result);
    stopTracing();
    return result;
  }

  public updateRTL(isRTL: boolean): void {
    this.surfaceHandleByAppKey.forEach(SurfaceHandle => {
      SurfaceHandle.updateRTL(isRTL);
    });
  }

  public updateState(componentName: string, tag: Tag, state: unknown): void {
    const stopTracing = this.logger.clone('updateState').startTracing();
    this.napiBridge.updateState(this.id, componentName, tag, state);
    stopTracing();
  }

  public onBackPress() {
    this.emitDeviceEvent('hardwareBackPress', {});
  }

  public onForeground() {
    if (this.lifecycleState === LifecycleState.BEFORE_CREATE) {
      return
    }
    this.lifecycleState = LifecycleState.READY;
    this.lifecycleEventEmitter.emit('FOREGROUND');
    this.postMessageToCpp('FOREGROUND', {});
  }

  public onBackground() {
    if (this.lifecycleState === LifecycleState.BEFORE_CREATE) {
      return
    }
    this.lifecycleState = LifecycleState.PAUSED;
    this.lifecycleEventEmitter.emit('BACKGROUND');
    this.postMessageToCpp('BACKGROUND', {});
  }

  public onNewWant(url: string) {
    this.emitDeviceEvent('url', { url: url });
  }

  public onConfigurationUpdate(
    ...args: Parameters<UIAbility['onConfigurationUpdate']>
  ) {
    this.lifecycleEventEmitter.emit('CONFIGURATION_UPDATE', ...args);
  }

  public onWindowReactChange(isWindowRectDrag: boolean) {
    this.lifecycleEventEmitter.emit("WINDOW_RECT_DRAG", isWindowRectDrag);
  }

  public onWindowSizeChange(windowSize: window.Size) {
    this.lifecycleEventEmitter.emit('WINDOW_SIZE_CHANGE', windowSize);
    this.postMessageToCpp('WINDOW_SIZE_CHANGE', windowSize);
  }

  public onWindowStageChange(windowStageEvent: window.WindowStageEventType) {
    if (windowStageEvent == window.WindowStageEventType.ACTIVE) {
      this.stageEventEmitter.emit('APP_STATE_FOCUS');
    } else if (windowStageEvent == window.WindowStageEventType.INACTIVE) {
      this.stageEventEmitter.emit('APP_STATE_BLUR');
    }
  }

  private getNextSurfaceTag(): Tag {
    // NOTE: this is done to mirror the iOS implementation.
    // For details, see `RCTAllocateRootViewTag` in iOS implementation.
    return this.surfaceCounter++ * 10 + 1;
  }

  public shouldUIBeUpdated(): boolean {
    return this.lifecycleState === LifecycleState.READY;
  }

  public bindComponentNameToDescriptorType(
    componentName: string,
    descriptorType: string,
  ): void {
    this.componentNameByDescriptorType.set(descriptorType, componentName);
  }

  public getComponentNameFromDescriptorType(descriptorType: string): string {
    if (this.componentNameByDescriptorType.has(descriptorType)) {
      return this.componentNameByDescriptorType.get(descriptorType)!;
    }
    return descriptorType;
  }

  public getInitialBundleUrl(): string | undefined {
    return this.initialBundleUrl;
  }

  private subscribeToDevTools() {
    const emitter = this.devToolsController.eventEmitter;
    this.unregisterDevToolsMessageListeners.push(emitter.subscribe('TOGGLE_ELEMENT_INSPECTOR', () =>
      this.emitDeviceEvent('toggleElementInspector', {}),
    ));

    this.unregisterDevToolsMessageListeners.push(emitter.subscribe('DEV_MENU_SHOWN', () =>
      this.emitDeviceEvent('RCTDevMenuShown', {}),
    ));

    this.unregisterDevToolsMessageListeners.push(emitter.subscribe('DID_PRESS_MENU_ITEM', item =>
      this.emitDeviceEvent('didPressMenuItem', item),
    ));

    this.unregisterDevToolsMessageListeners.push(emitter.subscribe('OPEN_DEBUGGER', (onError) => {
      DevServerHelper.openDebugger(this.initialBundleUrl, this.napiBridge, onError);
    }));
  }

  public postMessageToCpp(name: string, payload: any): void {
    this.napiBridge.postMessageToCpp(name, { rnInstanceId: this.id, payload });
  }

  public logMarker(markerId: string): void {
    this.napiBridge.logMarker(markerId, this.id);
  }

  public subscribeToRNOHErrors(listener: (err: RNInstanceError) => void): () => void {
    return this.rnInstanceErrorEventEmitter.subscribe("NEW_ERROR", listener)
  }

  public reportRNOHError(rnohError: RNOHError) {
    const rnInstanceError = new RNInstanceError(rnohError, { name: this.name, id: this.id });
    this.globalRNOHErrorEventEmitter.emit('NEW_ERROR', rnInstanceError);
    this.rnInstanceErrorEventEmitter.emit('NEW_ERROR', rnInstanceError)
  }

  public setFrameNodeFactory(frameNodeFactory: FrameNodeFactory | null) {
    this.frameNodeFactoryRef.frameNodeFactory = frameNodeFactory;
  }

  public cancelTouches() {
    this.postMessageToCpp('CANCEL_TOUCHES', { rnInstanceId: this.id });
  }

  public getNativeNodeIdByTag(tag: Tag): string | undefined {
    return this.napiBridge.getNativeNodeIdByTag(this.id, tag);
  }

  public setUIContext(uiCtx: UIContext): void {
    this.uiCtx = uiCtx;
  }

  public getUIContext(): UIContext {
    return this.uiCtx;
  }

  public registerFont(
    fontFamily: string,
    fontResource: Resource | string,
  ): void {
    const fontPath = (() => {
      if (typeof fontResource === 'string') {
        if (!fontResource.startsWith('/')) {
          throw new RNOHError({
            whatHappened:
              'Font path must be an absolute path or a $rawfile Resource',
            howCanItBeFixed: [
              'Provide an absolute path to the font (starting with a "/")',
            ],
          });
        }
        font.registerFont({ familyName: fontFamily, familySrc: `file://${fontResource}` })
        return fontResource;
      } else {
        font.registerFont({ familyName: fontFamily, familySrc: fontResource });
        return fontResource.params![0];
      }
    })();
    this.fontPathByFontFamily[fontFamily] = fontPath;
    this.napiBridge.registerFont(this.id, fontFamily, fontPath);
  }

  public postTouchEventMessageToCpp(
    rootTouchTargetTag: number,
    touchEvent: TouchEvent,
  ) {
    this.postMessageToCpp('RNOH::TOUCH_EVENT', {
      tag: rootTouchTargetTag,
      touchEvent: touchEvent,
    });
  }

  private registerRNOHMarker() {
    this.cppEventEmitter.subscribe("logRNOHMarker",
      (payload: RNOHMarkerEventPayload): void =>
        RNOHMarker.notifyListeners(payload.markerId, payload.tag,
          payload.timestamp
        )
    )
  }
}
