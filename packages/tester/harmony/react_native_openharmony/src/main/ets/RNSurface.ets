/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  ComponentBuilderContext,
  CustomRNComponentFrameNodeFactory,
  Descriptor,
  DisplayMode,
  RNComponentContext,
  RNInstanceImpl,
  RNOHContext,
  RNOHError,
  RNOHLogger,
} from './RNOH';
import { ViewBaseProps, ViewRawProps } from './RNOHCorePackage/components/RNViewBase';
import { SurfaceHandle, SurfaceProps } from './RNOH/SurfaceHandle';
import { I18nManagerTurboModule } from './RNOHCorePackage/turboModules';
import type { SurfaceContextWithConstraints } from './RNOH/RNInstance';
import { NodeContent } from '@ohos.arkui.node'

interface RootViewState {}

export type RootDescriptor = Descriptor<"RootView", ViewBaseProps, RootViewState, ViewRawProps>;

/**
 * @api: RN_APP_DEVELOPER
 * RN_APP_DEVELOPER is responsible for creating and deleting a SurfaceHandle.
 */
export interface UnmanagedSurfaceConfig {
  surfaceHandle: SurfaceHandle
}

/**
 * @api: RN_APP_DEVELOPER
 * @deprecated: use UnmanagedSurfaceConfig instead (latestRNOHVersion: 0.72.39)
 */
export type SurfaceConfig1 = UnmanagedSurfaceConfig

/**
 * @api: RN_APP_DEVELOPER
 * RNOH is responsible for creating and deleting a SurfaceHandle.
 */
export interface ManagedSurfaceConfig {
  appKey: string,
  initialProps: SurfaceProps,
}

/**
 * @api: RN_APP_DEVELOPER
 * @deprecated: use ManagedSurfaceConfig instead (latestRNOHVersion: 0.72.39)
 */
export type SurfaceConfig2 = ManagedSurfaceConfig

/**
 * @api: RN_APP_DEVELOPER
 */
export type SurfaceConfig = UnmanagedSurfaceConfig | ManagedSurfaceConfig

interface RootComponentDimensionsChangedPayload {
  surfaceId: number,
  width: number,
  height: number
}

interface Size {
  width: number
  height: number
}

/**
 * @api
 */
interface Constraints {
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

/**
 * @api: RN_APP_DEVELOPER
 * RNSurface is a core bridge component that integrates a React Native surface into an ArkTS UI component.
 *
 * It is responsible for creating, attaching, and managing the lifecycle and layout of a React Native rendering surface.
 * This component supports both managed and unmanaged surface configurations, and allows for custom layout constraints.
 *
 * Key responsibilities:
 * - Embeds a React Native root component within ArkTS layout system.
 * - Handles dynamic measurement and placement of React Native content.
 * - Connects with RNInstancesCoordinator and manages surface start/stop behavior.
 * - Enables passing of initial props and display mode control.
 *
 * Typical usage:
 * - Used when you want to embed a mini RN app inside a larger ArkTS-based application.
 * - Supports custom RNComponentContext for native-to-RN component registration.
 *
 * Requirements:
 * - `ctx` must be of type `RNComponentContext` to support custom RN components.
 * - Either `ManagedSurfaceConfig` or `UnmanagedSurfaceConfig` must be passed via `surfaceConfig`.
 */ 
@Component
export struct RNSurface {
  /** 
   * Required context object. Should be of type RNComponentContext to support custom components.
   */
  @Require public ctx!: RNOHContext | RNComponentContext;

  /**
   * Configuration object for the surface, containing either managed or unmanaged setup.
   */
  @Require public surfaceConfig!: SurfaceConfig;

  /**
   * Custom constraints for the surface (e.g., maxWidth, maxHeight). 
   * These override ArkUI-provided constraints.
   */
  public constraints: Constraints | undefined = undefined;

  /**
   * Optional builder callback for constructing custom native components.
   * Required only if ctx is NOT an RNComponentContext.
   * @deprecated: Use RNComponentContext with RNSurface::ctx instead.
   */
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void;

  // -------------------------------------------------------------------------------------------------------------------
  /** Horizontal offset of the surface relative to the root view. */
  private surfaceOffsetX: number = 0;

  /** Vertical offset of the surface relative to the root view. */
  private surfaceOffsetY: number = 0;

  /** Stores the dimensions of the root React Native component. */
  @State private rootComponentSize: Size | undefined = undefined;

  /** Indicates if the surface should start rendering. */
  @State private shouldStartSurface: boolean = false;

  /** Handle object for surface rendering and interaction. */
  private surfaceHandle!: SurfaceHandle;

  /** Holds all cleanup functions to unsubscribe listeners, etc. */
  private cleanUpCallbacks: (() => void)[] = [];

  /** Indicates whether the surface should be stopped and destroyed on disappear. */
  private shouldStopSurface: boolean = false;

  /** Initial props passed to the React Native surface at creation time. */
  private initialProps!: SurfaceProps;

  /** Logger instance specific to RNSurface. */
  private logger!: RNOHLogger;

  /** Root view container used for rendering native content nodes. */
  private rootViewNodeContent: NodeContent = new NodeContent();

  /** ID of the debounce timer (used for delaying layout updates). */
  private timerId: undefined | number = undefined;

  /** Timestamp of the last layout or constraint update in milliseconds. */
  private lastChangeTimeInMs: number = 0;

  /** Whether the user is actively dragging a window or surface. */
  private isWindowRectDrag: boolean = false;

  /** Stores the size of the last measured layout. */
  private currentMeasuredSize: Size | undefined = undefined;

  /** Flag indicating if the latest constraint update came from a timeout. */
  private isLatestConstraintsUpdateFromTimeout: boolean = false;

  /**
   * Delay for applying layout constraint updates.
   * NOTE: This should be synchronized with RNInstancesCoordinator's onWindowSizeChange delay.
   */
  private readonly surfaceConstraintsDebounceTimeInMs: number = 100;

  /**
   * Lifecycle method triggered when the component is mounted.
   * Initializes logger, sets up context and subscriptions, creates or attaches the surface.
   */
  aboutToAppear() {
    this.logger = this.ctx.logger.clone("RNSurface")
    if (!(this.ctx instanceof RNComponentContext)) {
      this.ctx.reportRNOHError(new RNOHError({
        whatHappened: "RNSurface received RNOHContext instead of RNComponentContext. Custom RN components won't be visible.",
        howCanItBeFixed: ["Provide RNComponentContext instead of RNOHContext"]
      }))
    }
    const stopTracing = this.logger.clone("aboutToAppear").startTracing();
    (this.ctx.rnInstance as RNInstanceImpl).setUIContext(this.getUIContext());
    this.ctx.rnInstance.setFrameNodeFactory(new CustomRNComponentFrameNodeFactory(this.getUIContext(), this.ctx.logger,
      () => {
        return this.ctx as RNComponentContext
      }))
    if (Object.keys(this.surfaceConfig).includes("surfaceHandle")) {
      this.surfaceHandle = (this.surfaceConfig as UnmanagedSurfaceConfig).surfaceHandle;
      this.surfaceHandle.setDisplayMode(DisplayMode.Visible);
    } else {
      this.surfaceHandle = this.ctx.rnInstance.createSurface((this.surfaceConfig as ManagedSurfaceConfig).appKey);
      this.initialProps = (this.surfaceConfig as ManagedSurfaceConfig).initialProps;
      this.shouldStartSurface = true;
      this.shouldStopSurface = true;
    }
    this.cleanUpCallbacks.push(this.ctx.rnInstance.cppEventEmitter.subscribe("RNOH::ROOT_COMPONENT_DIMENSIONS_CHANGED",
      (payload: RootComponentDimensionsChangedPayload) => {
        if (payload.surfaceId === this.surfaceHandle.getTag()) {
          this.rootComponentSize = { width: payload.width, height: payload.height }
        }
      }))
    this.cleanUpCallbacks.push(
      this.ctx.rnInstance.subscribeToLifecycleEvents("WINDOW_RECT_DRAG",
      (isWindowRectDrag: boolean) => {
        this.isWindowRectDrag = isWindowRectDrag;
      })
    )
    this.surfaceHandle.attachRootView(this.ctx.rnInstance.getId(), this.surfaceHandle.getTag(),
      this.rootViewNodeContent);
    stopTracing()
  }

  /**
   * Lifecycle method triggered before the component is destroyed.
   * Cleans up event listeners, stops and destroys the surface if needed.
   */
  aboutToDisappear() {
    const surfaceHandle = this.surfaceHandle;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = undefined;
    }
    (async () => {
      const stopTracing = this.logger.clone("aboutToDisappear").startTracing()
      this.cleanUpCallbacks.forEach(cb => cb())
      if (this.shouldStopSurface) {
        if (!surfaceHandle.isDestroyed()) {
          // It's possible for the ability to clean up before us. This is acceptable.
          await surfaceHandle.stop();
          surfaceHandle.destroy();
        }
      } else if (surfaceHandle?.getDisplayMode() === DisplayMode.Visible) {
        surfaceHandle.setDisplayMode(DisplayMode.Suspended);
      }
      this.surfaceHandle.detachRootView(this.ctx.rnInstance.getId(), this.surfaceHandle.getTag())
      stopTracing()
    })()
  }

  /**
   * Updates the surface constraints based on current layout bounds.
   * Starts the surface if it hasn't already started.
   * @param constraints Constraints from the layout system
   * @returns Measured size of the root component
   */
  updateSurfaceConstraints(constraints: Constraints): Size {
    const isRTL = this.ctx.rnInstance.getTurboModule<I18nManagerTurboModule>('I18nManager').getConstants()
      .isRTL;
    const surfaceContext: SurfaceContextWithConstraints = {
      minWidth: this.constraints?.minWidth ?? constraints?.minWidth ?? 0,
      minHeight: this.constraints?.minHeight ?? constraints?.minHeight ?? 0,
      maxWidth: this.constraints?.maxWidth ?? constraints?.maxWidth ?? 0,
      maxHeight: this.constraints?.maxHeight ?? constraints?.maxHeight ?? 0,
      surfaceOffsetX: this.surfaceOffsetX,
      surfaceOffsetY: this.surfaceOffsetY,
      pixelRatio: vp2px(1),
      isRTL,
    }
    if (this.shouldStartSurface) {
      this.surfaceHandle.setDisplayMode(DisplayMode.Visible)
      this.surfaceHandle.start(surfaceContext, this.initialProps)
      this.shouldStartSurface = false
    } else {
      this.surfaceHandle.updateConstraints(surfaceContext);
    }
    return this.surfaceHandle.measure(surfaceContext)
  }

  /**
   * Custom layout measuring logic for the surface and its child components.
   * Applies debouncing logic during window drag events.
   */
  override onMeasureSize(selfLayoutInfo: GeometryInfo, children: Array<Measurable>,
    constraint: ConstraintSizeOptions): SizeResult {
    if (this.surfaceHandle.isDestroyed()) {
      return {width: 0, height: 0};
    }    
    const currentTime = Date.now(); 
    if (!this.isWindowRectDrag || 
      (currentTime - this.lastChangeTimeInMs > this.surfaceConstraintsDebounceTimeInMs) || 
      this.isLatestConstraintsUpdateFromTimeout) {
      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = undefined;
      }
      this.currentMeasuredSize =
        this.updateSurfaceConstraints({
          minWidth: constraint.maxWidth as number,
          minHeight: constraint.minHeight as number,
          maxWidth: constraint.maxWidth as number,
          maxHeight: constraint.maxHeight as number,
        })
      this.isLatestConstraintsUpdateFromTimeout = false;
      this.lastChangeTimeInMs = currentTime;
    } else {
      if(this.timerId){
        clearTimeout(this.timerId)
        this.timerId = undefined;
      }
      this.timerId = setTimeout(() =>{
        this.currentMeasuredSize =
        this.updateSurfaceConstraints({
          minWidth: constraint.maxWidth as number,
          minHeight: constraint.minHeight as number,
          maxWidth: constraint.maxWidth as number,
          maxHeight: constraint.maxHeight as number,
        })
        this.timerId = undefined;
        this.isLatestConstraintsUpdateFromTimeout = true;
        this.lastChangeTimeInMs = Date.now();
      }, this.surfaceConstraintsDebounceTimeInMs)
    }
    const measuredSize = this.currentMeasuredSize;
    const newSize: Size =
      { width: measuredSize?.width || selfLayoutInfo.width, height: measuredSize?.height || selfLayoutInfo.height }
    children.forEach((child) => {
      child.measure({
        minHeight: newSize.height,
        minWidth: newSize.width,
        maxWidth: newSize.width,
        maxHeight: newSize.height
      })
    })
    return newSize
  }

  /**
   * Places child components inside the layout area.
   * Required for children to be visible.
   */
  override onPlaceChildren(selfLayoutInfo: GeometryInfo, children: Array<Layoutable>,
    constraint: ConstraintSizeOptions) {
    children.forEach((child) => {
      child.layout({ x: 0, y: 0 })
    })
  }

  /**
   * Builds the layout and behavior of the component.
   * The size is managed by layout methods, so width/height are only placeholders for triggering calculations.
   */
  build() {
    Stack() {
      ContentSlot(this.rootViewNodeContent)
    }
    .width(this.rootComponentSize?.width)
    .height(this.rootComponentSize?.height)
    .onAreaChange((oldArea, newArea) => {
      this.surfaceOffsetX = newArea.globalPosition.x as number
      this.surfaceOffsetY = newArea.globalPosition.y as number
    })
    .hitTestBehavior(HitTestMode.Transparent)
  }
}

