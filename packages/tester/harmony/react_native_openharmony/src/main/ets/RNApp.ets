/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LogBoxTurboModule, buildRNComponent } from './RNOHCorePackage';
import {
  Tag,
  RNOHError,
  JSBundleProvider,
  RNInstance,
  RNInstanceOptions,
  RNOHLogger,
  CustomComponentBuilder,
  RNDevLoadingView,
  RNComponentContext,
  WrappedCustomRNComponentBuilder,
  RNOHCoreContext,
  RNOHContext,
  ComponentBuilderContext,
} from './RNOH';
import { RNSurface } from './RNSurface';
import { LogBoxDialog } from "./LogBoxDialog"
import { RNPauseInDebuggerDialog } from "./RNOH/RNPauseInDebuggerDialog"

/**
 * @api: RN_APP_DEVELOPER
 * RN_APP_DEVELOPER is responsible for creating and deleting an RNInstance.
 */
interface UnmanagedRNInstanceConfig {
  rnInstance: RNInstance
}

/**
 * @api: RN_APP_DEVELOPER
 * RNOH is responsible for creating and deleting an RNInstance.
 */
type ManagedRNInstanceConfig = RNInstanceOptions

/**
 * @api RN_APP_DEVELOPER
 *
 * Represents the configuration for a React Native instance.
 * This type is a union of two modes:
 *
 * - `UnmanagedRNInstanceConfig`: The RN_APP_DEVELOPER is responsible for creating
 *   and deleting the RNInstance. This provides more control over the instance lifecycle.
 *
 * - `ManagedRNInstanceConfig`: The RNInstance is managed by RNOH, which handles the
 *   creation and deletion internally. This simplifies usage for most scenarios.
 *
 * Use this type when you need to configure how the RNInstance is initialized and managed.
 */
export type RNInstanceConfig = UnmanagedRNInstanceConfig | ManagedRNInstanceConfig

@Builder
export function buildRNComponentForTag(ctx: RNComponentContext, tag: Tag) {
  buildRNComponent(ctx, ctx.descriptorRegistry.findDescriptorWrapperByTag(tag)!)
}


@Builder
export function buildCustomRNComponent(ctx: ComponentBuilderContext) {
  if (ctx.customRNComponentWrappedBuilderByName.has(ctx.componentName)) {
    ctx.customRNComponentWrappedBuilderByName.get(ctx.componentName)!.builder(ctx)
  } else if (ctx.rnComponentContext.customWrappedCustomRNComponentBuilder !== undefined) {
    ctx.rnComponentContext.customWrappedCustomRNComponentBuilder!.builder(ctx)
  }
}

const wrappedCustomRNComponentBuilder = wrapBuilder(buildCustomRNComponent)


/**
 * @api: RN_APP_DEVELOPER
 * RNApp is a high-level component for embedding a single React Native application surface into an ArkTS-based app.
 *
 * This component handles the creation, lifecycle management, and rendering of a React Native instance (`RNInstance`)
 * and its corresponding surface (`RNSurface`). It is intended for apps that only require a single surface.
 * For multiple embedded RN surfaces, consider using `RNSurface` directly.
 *
 * Key responsibilities:
 * - Initializes and manages RNInstance lifecycle (either from options or external instance).
 * - Loads and executes the JS bundle, if provided.
 * - Automatically instantiates an `RNSurface` and passes the app key and props.
 * - Handles debugging dialogs and developer tool integration.
 * - Supports automatic reloading through dev events.
 *
 * Typical usage:
 * - Use this component to launch a full React Native app inside a HarmonyOS-based UI.
 * - Suitable for scenarios where only one React Native root is needed.
 *
 * Requirements:
 * - `rnInstanceConfig` must be provided, either as an RNInstance or RNInstanceOptions.
 * - `appKey` should match the one registered in the JS bundle via `AppRegistry.registerComponent`.
 * - Optionally provide a `jsBundleProvider` to trigger bundle execution.
 */
@Component
@Preview
export struct RNApp {
  /**
   * Configuration object for the RNInstance.
   * Can be either an existing RNInstance (unmanaged) or options to create one (managed).
   */
  @Require public rnInstanceConfig!: RNInstanceConfig;

  /**
   * The app key registered in React Native via `AppRegistry.registerComponent`.
   */
  @Require public appKey: string = '';

  /**
   * JS bundle provider to load and execute the JavaScript bundle for the RN app.
   * If omitted, assumes the bundle is already loaded.
   */
  public jsBundleProvider: JSBundleProvider | undefined = undefined;

  /**
   * Initial props to pass to the root React Native component on surface creation.
   */
  public initialProps: Record<string, string> = {};

  /**
   * @deprecated Use `RNOHPackage` to register custom components instead (from RNOH version 0.75.1).
   *
   * Builder for manually injecting custom native-to-RN fabric components.
   * Should only be used if `RNOHPackage`-based registration is not available.
   */
  public wrappedCustomRNComponentBuilder: WrappedCustomRNComponentBuilder | undefined = undefined;

  /**
   * Optional hook called once the RNInstance is created but before the surface is rendered.
   * Useful for configuring the instance or registering callbacks.
   */
  public onSetUp: (rnInstance: RNInstance) => Promise<void> | void = () => Promise.resolve();

  // -------------------------------------------------------------------------------------------------------------------
  /** Core RNOH context object from ArkTS runtime. */
  @StorageLink('RNOHCoreContext') private rnohCoreContext: RNOHCoreContext | undefined = undefined;

  /** Internal RNInstance used to manage the RN surface lifecycle. */
  private rnInstance!: RNInstance;

  /** Whether to show the rendered surface or not. */
  @State private shouldShow: boolean = false;

  /** Debug log box controller for showing RN warnings and errors. */
  private logBoxDialogController!: CustomDialogController;

  /** Controller for debugger pause dialog (only in debug mode). */
  private pauseDebuggerDialogController!: CustomDialogController;

  /** Indicates whether this component should clean up the RNInstance on unmount. */
  private shouldDestroyRNInstance: boolean = false;

  /** Stores teardown callbacks for event listeners and resource cleanup. */
  private cleanUpCallbacks: (() => void)[] = [];

  /** Logger instance specific to RNApp. */
  private logger!: RNOHLogger;

  /** Internal RNComponentContext used by RNSurface. */
  private ctx!: RNComponentContext;

  /**
   * Lifecycle hook triggered when the component appears.
   * Initializes RNInstance and sets up the surface.
   */
  aboutToAppear(): void {
    this.init()
  }

  /**
   * Lifecycle hook triggered when the component disappears.
   * Cleans up resources, stops the RNInstance if necessary.
   */
  aboutToDisappear() {
    this.cleanUp()
  }

  /**
   * Reloads the RN application and resets all related state.
   * Used for development tooling like "Reload JS".
   */
  async reloadApp() {
    await this.cleanUp();
    this.init();
  }

  /**
   * Initializes the RNInstance and sets up RNSurface and related behaviors.
   */
  private async init() {
    this.logger = this.rnohCoreContext!.logger.clone("RNApp")
    const stopTracing = this.logger.clone("init").startTracing()

    try {
      await (async () => {
        this.rnInstance = await this.getOrCreateRNInstance()
        this.ctx = new RNComponentContext(
          RNOHContext.fromCoreContext(this.rnohCoreContext, this.rnInstance),
          wrappedCustomRNComponentBuilder,
          wrapBuilder(buildRNComponentForTag),
          new Map(),
          this.wrappedCustomRNComponentBuilder // backward compatibility
        )

        // Initialize log box dialog for RN error/warning messages
        this.logBoxDialogController = new CustomDialogController({
          cornerRadius: 0,
          customStyle: true,
          alignment: DialogAlignment.TopStart,
          backgroundColor: Color.Transparent,
          builder: LogBoxDialog({
            ctx: this.ctx,
            rnInstance: this.rnInstance,
            initialProps: this.initialProps
          })
        })

        // Subscribe to log box and reload events
        this.cleanUpCallbacks.push(this.rnInstance.getTurboModule<LogBoxTurboModule>(LogBoxTurboModule.NAME).eventEmitter.subscribe("SHOW",
          () => this.logBoxDialogController.open()))
        this.cleanUpCallbacks.push(this.rnInstance.getTurboModule<LogBoxTurboModule>(LogBoxTurboModule.NAME).eventEmitter.subscribe("HIDE",
          () => this.logBoxDialogController.close()))
        this.cleanUpCallbacks.push(this.ctx.devToolsController.eventEmitter.subscribe("RELOAD", async () => {
          await this.reloadApp();
        }))
        this.cleanUpCallbacks.push(this.ctx.rnInstance.cppEventEmitter.subscribe("RNOH::ON_RELOAD", async () => {
          await this.reloadApp();
        }))

        // Call user-defined setup logic
        await this.onSetUp(this.rnInstance)

        // Run bundle if needed
        const jsBundleExecutionStatus = this.rnInstance.getBundleExecutionStatus(this.jsBundleProvider?.getURL())
        if (this.jsBundleProvider && jsBundleExecutionStatus === undefined) {
          await this.rnInstance.runJSBundle(this.jsBundleProvider)
          this.shouldShow = true
          return;
        }

        // Wait until bundle execution completes
        if (jsBundleExecutionStatus !== "DONE") {
          this.cleanUpCallbacks.push(this.rnInstance.subscribeToLifecycleEvents("JS_BUNDLE_EXECUTION_FINISH",
            (args) => {
              if (args.appKeys.includes(this.appKey)) {
                this.shouldShow = true
              }
            }))
        } else {
          this.shouldShow = true
        }
      })()
      stopTracing()
    } catch (err) {
      if (err instanceof RNOHError) {
        this.rnohCoreContext!.reportRNOHError(err)
      } else if (typeof err === "string") {
        this.rnohCoreContext!.logger.error(err)
      } else if (err instanceof Error) {
        this.rnohCoreContext!.logger.error(err.message)
      } else {
        this.rnohCoreContext!.logger.error("Fatal exception")
      }
      stopTracing()
    }
  }

  /**
   * Destroys the RNInstance if owned, and cleans up all event listeners.
   */
  private async cleanUp() {
    const stopTracing = this.logger.clone("cleanUp").startTracing()
    this.shouldShow = false
    if (this.shouldDestroyRNInstance) {
      await this.rnohCoreContext!.destroyAndUnregisterRNInstance(this.rnInstance)
    }
    this.cleanUpCallbacks.forEach(cleanUp => cleanUp())
    stopTracing()
  }

  /**
   * Returns a managed or unmanaged RNInstance depending on the config.
   */
  private getOrCreateRNInstance(): Promise<RNInstance> {
    if (Object.keys(this.rnInstanceConfig).includes("rnInstance")) {
      return Promise.resolve((this.rnInstanceConfig as UnmanagedRNInstanceConfig).rnInstance)
    } else {
      const options = this.rnInstanceConfig
      this.shouldDestroyRNInstance = true
      return this.rnohCoreContext!.createAndRegisterRNInstance(options as ManagedRNInstanceConfig)
    }
  }

  /**
   * Renders the layout and underlying RNSurface.
   * Automatically inserts debugger overlays when in debug mode.
   */
  build() {
    Stack() {
      if (this.shouldShow && this.rnohCoreContext!.isDebugModeEnabled) {
        RNPauseInDebuggerDialog({ ctx: this.ctx })
      }
      if (this.shouldShow) {
        RNSurface({
          ctx: this.ctx,
          surfaceConfig: {
            initialProps: this.initialProps ?? {},
            appKey: this.appKey,
          },
        })
      }
      if (this.rnohCoreContext!.isDebugModeEnabled) {
        RNDevLoadingView({ useSafeAreaInsets: true, ctx: this.rnohCoreContext }).position({ x: 0, y: 0 })
      }
    }
    .expandSafeArea([SafeAreaType.KEYBOARD])
    .hitTestBehavior(HitTestMode.Transparent)
    .width("100%")
    .height("100%")
  }
}
