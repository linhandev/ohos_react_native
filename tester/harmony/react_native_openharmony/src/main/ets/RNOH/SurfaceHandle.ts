import { DisplayMode } from './CppBridgeUtils';
import type { Tag } from './DescriptorBase';
import type { NapiBridge } from './NapiBridge';
import type { RNInstance, SurfaceContext } from './RNInstance';

export type SurfaceProps = Record<string, any>;

export class SurfaceHandle {
  private destroyed: boolean = false;
  private displayMode: DisplayMode = DisplayMode.Suspended;
  private props: SurfaceProps
  private startingPromise: Promise<unknown> | undefined = undefined
  private running: boolean = false
  private surfaceCtx: SurfaceContext = null;

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

  public getTag(): Tag {
    return this.tag;
  }

  public start(ctx: SurfaceContext, props: SurfaceProps) {
    if (this.destroyed) {
      throw new Error("start called on a destroyed surface");
    }

    this.surfaceCtx = ctx;
    this.props = { ...this.defaultProps, ...props };
    this.napiBridge.startSurface(
      this.rnInstance.getId(),
      this.tag,
      ctx.minWidth,
      ctx.minHeight,
      ctx.maxWidth,
      ctx.maxHeight,
      ctx.surfaceOffsetX,
      ctx.surfaceOffsetY,
      ctx.pixelRatio,
      ctx.isRTL,
      this.props);
    this.running = true
  }

  public async stop() {
    if (this.destroyed) {
      throw new Error("stop called on a destroyed surface");
    }
    await this.napiBridge.stopSurface(this.rnInstance.getId(), this.tag);
    this.running = false
  }

  public updateConstraints(
    {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      surfaceOffsetX,
      surfaceOffsetY,
      pixelRatio,
      isRTL,
    }: SurfaceContext
  ) {
    if (this.destroyed) {
      throw new Error("updateConstraints called on a destroyed surface");
    }
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

  public updateRTL(isRTL: boolean) {
    const {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
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

  measure({
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    surfaceOffsetX,
    surfaceOffsetY,
    pixelRatio,
    isRTL,
  }: SurfaceContext) {
    return this.napiBridge.measureSurface(this.rnInstance.getId(), this.tag, minWidth, minHeight, maxWidth, maxHeight,
      surfaceOffsetX,
      surfaceOffsetY, pixelRatio, isRTL)
  }

  public getDisplayMode(): DisplayMode {
    return this.displayMode;
  }

  public setDisplayMode(displayMode: DisplayMode) {
    if (this.destroyed) {
      throw new Error("setDisplayMode called on a destroyed surface");
    }
    this.napiBridge.setSurfaceDisplayMode(this.rnInstance.getId(), this.tag, displayMode);
  }

  public getProps(): SurfaceProps {
    return this.props;
  }

  public setProps(props: SurfaceProps) {
    this.props = { ...this.defaultProps, ...props };
    this.napiBridge.setSurfaceProps(this.rnInstance.getId(), this.tag, this.props);
  }

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

  public isRunning() {
    return this.running;
  }

  public isDestroyed() {
    return this.destroyed;
  }
}