/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DisplayMode } from './CppBridgeUtils';
import type { Tag } from './DescriptorBase';
import type { NapiBridge } from './NapiBridge';
import type { RNInstance, SurfaceContext} from './RNInstance';
import { NodeContent } from '@ohos.arkui.node';

export type SurfaceProps = Record<string, any>;

function getConstraints(ctx: SurfaceContext): {
  minWidth: number
  minHeight: number
  maxWidth: number
  maxHeight: number
} {
  if ('width' in ctx) {
    return {
      minWidth: ctx.width,
      minHeight: ctx.height,
      maxWidth: ctx.width,
      maxHeight: ctx.height,
    }
  } else {
    return ctx
  }
}

/**
 * @actor RNOH_APP
 * @brief Native wrapper for cpp (and JS) methods of a surface
 */
export class SurfaceHandle {
  private destroyed: boolean = false;
  private displayMode: DisplayMode = DisplayMode.Suspended;
  private props: SurfaceProps
  private startingPromise: Promise<unknown> | undefined = undefined
  private running: boolean = false
  private surfaceCtx: SurfaceContext = null;

  /**
   * @param rnInstance - RNInstance Id
   * @param tag - surface tag
   * @param appKey - App name. Check react-native/Libraries/AppRegistry for more info.
   * @param defaultProps - Default props. Check setSurfaceProps at react-native/Libraries/AppRegistry for more info.
   * @param napiBridge - Native API Bridge
   * @param onDestroyed - cleanup callback
   */
  constructor(
    private rnInstance: RNInstance,
    private tag: Tag,
    private appKey: string,
    private defaultProps: SurfaceProps,
    private napiBridge: NapiBridge,
    private onDestroyed: (surfaceHandle: SurfaceHandle) => void,
  ) {
    this.rnInstance.descriptorRegistry.createRootDescriptor(this.tag);
    this.napiBridge.createSurface(this.rnInstance.getId(), this.tag, this.appKey);
    this.props = defaultProps;
  }

  /**
   * @returns surface tag
   */
  public getTag(): Tag {
    return this.tag;
  }

  /**
   * @brief Start surface.
   * Check runApplication at react-native/Libraries/AppRegistry for more info.
   * @param ctx - Surface Context
   * @param props - initial props. Check setSurfaceProps for more info.
   * @throws Error if surface has already been destroyed
   */
  public start(ctx: SurfaceContext, props: SurfaceProps) {
    if (this.destroyed) {
      throw new Error("start called on a destroyed surface");
    }

    this.surfaceCtx = ctx;
    this.props = { ...this.defaultProps, ...props };
    const {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    } = getConstraints(ctx);
    this.napiBridge.startSurface(
      this.rnInstance.getId(),
      this.tag,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      ctx.surfaceOffsetX,
      ctx.surfaceOffsetY,
      ctx.pixelRatio,
      ctx.isRTL,
      this.props);
    this.running = true
  }

  /**
   * @brief Stop surface.
   * Check RN$stopSurface at react-native/Libraries/Renderer/shims/ReactFabric for more info.
   * @throws Error if surface has already been destroyed
   */
  public async stop() {
    if (this.destroyed) {
      throw new Error("stop called on a destroyed surface");
    }
    await this.napiBridge.stopSurface(this.rnInstance.getId(), this.tag);
    this.running = false
  }

  /**
   * @brief Update surface Constraints.
   * Check SurfaceHandler::constraintLayout for more info.
   * @param ctx - Surface Context
   * @throws Error if surface has already been destroyed
   */
  public updateConstraints(
    ctx: SurfaceContext
  ) {
    if (this.destroyed) {
      throw new Error("updateConstraints called on a destroyed surface");
    }
    const {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    } = getConstraints(ctx);
    const {
      surfaceOffsetX,
      surfaceOffsetY,
      pixelRatio,
      isRTL,
    } = ctx;
    this.surfaceCtx = {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      surfaceOffsetX,
      surfaceOffsetY,
      isRTL,
      pixelRatio
    };

    this.napiBridge.updateSurfaceConstraints(
      this.rnInstance.getId(),
      this.tag,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      surfaceOffsetX,
      surfaceOffsetY,
      pixelRatio,
      isRTL,
    );
  }

  /**
   * @brief Update surface RTL.
   * Check SurfaceHandler::constraintLayout for more info.
   * @param isRTL - layout direction
   */
  public updateRTL(isRTL: boolean) {
    const {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    } = getConstraints(this.surfaceCtx);
    const {
      surfaceOffsetX,
      surfaceOffsetY,
      pixelRatio,
    } = this.surfaceCtx;

    this.surfaceCtx = {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      surfaceOffsetX,
      surfaceOffsetY,
      isRTL,
      pixelRatio
    };

    this.napiBridge.updateSurfaceConstraints(
      this.rnInstance.getId(),
      this.tag,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      surfaceOffsetX,
      surfaceOffsetY,
      pixelRatio,
      isRTL,
    );
  }

  /**
   * @brief Measure surface.
   * Check SurfaceHandler::measure for more info.
   * @param ctx - Surface Context
   * @returns surface size
   */
  measure(ctx: SurfaceContext) {
    const {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    } = getConstraints(ctx);
    const {
      surfaceOffsetX,
      surfaceOffsetY,
      pixelRatio,
      isRTL,
    } = ctx
    return this.napiBridge.measureSurface(this.rnInstance.getId(), this.tag, minWidth, minHeight, maxWidth, maxHeight,
      surfaceOffsetX,
      surfaceOffsetY, pixelRatio, isRTL)
  }

  /**
   * @returns current DisplayMode
   */
  public getDisplayMode(): DisplayMode {
    return this.displayMode;
  }

  /**
   * @brief Set DisplayMode.
   * @param displayMode - new DisplayMode
   * @throws Error if surface has already been destroyed
   */
  public setDisplayMode(displayMode: DisplayMode) {
    if (this.destroyed) {
      throw new Error("setDisplayMode called on a destroyed surface");
    }
    this.napiBridge.setSurfaceDisplayMode(this.rnInstance.getId(), this.tag, displayMode);
  }

  /**
   * @returns surface props.
   */
  public getProps(): SurfaceProps {
    return this.props;
  }

  /**
   * @brief Set surface props.
   * @param props - new props
   */
  public setProps(props: SurfaceProps) {
    this.props = { ...this.defaultProps, ...props };
    this.napiBridge.setSurfaceProps(this.rnInstance.getId(), this.tag, this.props);
  }

  /**
   * @brief Destroy surface.
   * Do nothing if surface has already been destroyed.
   * @throws Error if surface has not yet been stoped
   */
  public destroy() {
    if (this.destroyed) {
      return;
    }
    if (this.running) {
      throw new Error("Surface must be stopped before can be destroyed")
    }
    this.napiBridge.destroySurface(this.rnInstance.getId(), this.tag);
    this.destroyed = true
    this.rnInstance.descriptorRegistry.deleteRootDescriptor(this.tag);
    this.onDestroyed(this);
  }

  /**
   * @returns if surface is running.
   */
  public isRunning() {
    return this.running;
  }

  /**
   * @returns if surface is destroyed.
   */
  public isDestroyed() {
    return this.destroyed;
  }

  /**
   * @param instanceId - RNInstance Id
   * @param surfaceId - surface tag
   * @param nodeContent - content of ContentSlot, also root node of surface
   * @returns null
   * @throws RNOHError on cpp side if failed to get the RNInstance
   */
  public attachRootView(instanceId: number, surfaceId: number, nodeContent: NodeContent) {
    return this.napiBridge.attachRootView(instanceId, surfaceId, nodeContent);
  }

  /**
   * @param instanceId - RNInstance Id
   * @param surfaceId - surface tag
   * @returns null
   * @throws RNOHError on cpp side if failed to get the RNInstance
   */
  public detachRootView(instanceId: number, surfaceId: number) {
    return this.napiBridge.detachRootView(instanceId, surfaceId);
  }
}