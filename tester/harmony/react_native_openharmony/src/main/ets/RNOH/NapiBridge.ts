// @ts-ignore
import libRNOHApp from 'librnoh_app.so';
import type { TurboModuleProvider } from "./TurboModuleProvider";
import type { Mutation } from "./Mutation";
import type { Tag } from "./DescriptorBase";
import type { AttributedString, ParagraphAttributes, LayoutConstrains } from "./TextLayoutManager";
import { measureParagraph } from "./TextLayoutManager"
import type { DisplayMode } from './CppBridgeUtils'
import { RNOHLogger } from "./RNOHLogger"
import type { InspectorInstance, DisplayMetrics } from './types'
import { FatalRNOHError, RNOHError } from "./RNOHError"
import type { FrameNodeFactory } from "./RNInstance"
import ohosResourceManager from '@ohos.resourceManager';
import { AnyThreadTurboModule, UITurboModule,
  UITurboModuleContext,
  WorkerTurboModule, WorkerTurboModuleContext } from './TurboModule';
import display from '@ohos.display';

export type CppFeatureFlag = "ENABLE_NDK_TEXT_MEASURING" | "C_API_ARCH" | "WORKER_THREAD_ENABLED"

type RawRNOHError = {
  message: string,
  stacktrace?: string[],
  suggestions?: string[]
}

type envINFO = {
  isDebugModeEnabled: boolean,
  envId: number
}

type Result<TOK = null> = {
  ok: TOK,
  err: null
} | {
  ok: null,
  err: RawRNOHError
}

export interface ArkTSBridgeHandler {
  getDisplayMetrics: () => DisplayMetrics
  handleError: (rnohError: RNOHError) => void
  getFoldStatus: () => display.FoldStatus
  getIsSplitScreenMode: () => boolean
  getFontSizeScale: () => number
}

export class NapiBridge {
  private logger: RNOHLogger
  private libRNOHApp: any

  constructor(logger: RNOHLogger) {
    this.libRNOHApp = libRNOHApp;
    this.logger = logger.clone("NapiBridge")
  }

  onInit(shouldCleanUpRNInstances: boolean): envINFO {
    if (!this.libRNOHApp) {
      const err = new FatalRNOHError({
        whatHappened: "Couldn't create bindings between ETS and CPP. libRNOHApp is undefined.",
        howCanItBeFixed: []
      })
      this.logger.fatal(err)
      throw err
    }
    return this.libRNOHApp?.onInit(shouldCleanUpRNInstances);
  }

  registerWorkerTurboModuleProvider(turboModuleProvider: TurboModuleProvider<WorkerTurboModule | AnyThreadTurboModule>,
    rnInstanceId: number) {
    return this.libRNOHApp?.registerWorkerTurboModuleProvider(turboModuleProvider, rnInstanceId)
  }

  getNextRNInstanceId(): number {
    return this.libRNOHApp?.getNextRNInstanceId();
  }

  setBundlePath(instanceId: number, path: string): void {
    this.libRNOHApp?.setBundlePath(instanceId, path);
  }

  onCreateRNInstance(
    envId: number,
    instanceId: number,
    turboModuleProvider: TurboModuleProvider<UITurboModule | AnyThreadTurboModule>,
    frameNodeFactoryRef: { frameNodeFactory: FrameNodeFactory | null },
    mutationsListener: (mutations: Mutation[]) => void,
    componentCommandsListener: (tag: Tag,
      commandName: string,
      args: unknown) => void,
    onCppMessage: (type: string, payload: any) => void,
    shouldEnableDebugger: boolean,
    shouldEnableBackgroundExecutor: boolean,
    cppFeatureFlags: CppFeatureFlag[],
    resourceManager: ohosResourceManager.ResourceManager,
    arkTsComponentNames: Array<string>,
    fontFamilyNameByFontPathRelativeToRawfileDir: Record<string, string>
  ) {
    const cppFeatureFlagStatusByName = cppFeatureFlags.reduce((acc, cppFeatureFlag) => {
      acc[cppFeatureFlag] = true
      return acc
    }, {} as Record<CppFeatureFlag, boolean>)
    const result = this.libRNOHApp?.onCreateRNInstance(
      instanceId,
      turboModuleProvider,
      mutationsListener,
      componentCommandsListener,
      onCppMessage,
      (attributedString: AttributedString, paragraphAttributes: ParagraphAttributes,
       layoutConstraints: LayoutConstrains) => {
        try {
          const stopTracing = this.logger.clone("measureParagraph").startTracing()
          const result = measureParagraph(attributedString, paragraphAttributes, layoutConstraints)
          stopTracing()
          return result
        } catch (err) {
          console.error(err)
          throw err
        }
      },
      shouldEnableDebugger,
      shouldEnableBackgroundExecutor,
      cppFeatureFlagStatusByName,
      frameNodeFactoryRef,
      resourceManager,
      arkTsComponentNames,
      fontFamilyNameByFontPathRelativeToRawfileDir,
      envId
    );
    return result
  }

  onDestroyRNInstance(instanceId: number) {
    return this.libRNOHApp?.onDestroyRNInstance(instanceId)
  }

  emitComponentEvent(instanceId: number, tag: Tag, eventEmitRequestHandlerName: string, payload: any) {
    return this.libRNOHApp?.emitComponentEvent(instanceId, tag, eventEmitRequestHandlerName,
      payload);
  }

  loadScript(instanceId: number, bundle: ArrayBuffer, sourceURL: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const result = this.libRNOHApp?.loadScript(instanceId, bundle, sourceURL, (errorMsg: string) => {
        errorMsg ? reject(new Error(errorMsg)) : resolve()
      }) as Result<null>;
      if (result.err) {
        reject(result)
      }
    })
  }

  startSurface(
    instanceId: number,
    surfaceTag: number,
    initialSurfaceWidth: number,
    initialSurfaceHeight: number,
    surfaceOffsetX: number,
    surfaceOffsetY: number,
    pixelRatio: number,
    isRTL: boolean,
    initialProps: any) {
    const result = this.libRNOHApp?.startSurface(
      instanceId,
      surfaceTag,
      initialSurfaceWidth,
      initialSurfaceHeight,
      surfaceOffsetX,
      surfaceOffsetY,
      pixelRatio,
      isRTL,
      initialProps,
    );
    return result
  }

  updateSurfaceConstraints(
    instanceId: number,
    surfaceTag: number,
    surfaceWidth: number,
    surfaceHeight: number,
    surfaceOffsetX: number,
    surfaceOffsetY: number,
    pixelRatio: number,
    isRTL: boolean,
  ) {
    const result = this.libRNOHApp?.updateSurfaceConstraints(
      instanceId,
      surfaceTag,
      surfaceWidth,
      surfaceHeight,
      surfaceOffsetX,
      surfaceOffsetY,
      pixelRatio,
      isRTL
    );
    return result
  }

  createSurface(
    instanceId: number,
    surfaceTag: number,
    appKey: string,
  ) {
    const result = this.libRNOHApp?.createSurface(
      instanceId,
      surfaceTag,
      appKey,
    );
    return result
  }

  setSurfaceProps(
    instanceId: number,
    surfaceTag: number,
    props: Record<string, any>,
  ) {
    const result = this.libRNOHApp?.setSurfaceProps(
      instanceId,
      surfaceTag,
      props,
    )
    return result;
  }

  async stopSurface(
    instanceId: number,
    surfaceTag: number,
  ) {
    let resolveWait = () => {
    }
    const wait = new Promise<void>((resolve) => {
      resolveWait = () => {
        resolve()
      }
    })
    this.libRNOHApp?.stopSurface(
      instanceId,
      surfaceTag,
      () => resolveWait()
    );
    return wait;
  }

  async destroySurface(
    instanceId: number,
    surfaceTag: number,
  ) {
    const result = this.libRNOHApp?.destroySurface(
      instanceId,
      surfaceTag
    );
    return result
  }

  setSurfaceDisplayMode(instanceId: number, surfaceTag: Tag, displayMode: DisplayMode): void {
    const result = this.libRNOHApp?.setSurfaceDisplayMode(instanceId, surfaceTag, displayMode);
    return result
  }

  callRNFunction(instanceId: number, moduleName: string, functionName: string, args: unknown[]): void {
    const result = this.libRNOHApp?.callRNFunction(instanceId, moduleName, functionName, args);
    return result
  }

  onMemoryLevel(level: number): void {
    const result = this.libRNOHApp?.onMemoryLevel(level)
    return result
  }

  updateState(instanceId: number, componentName: string, tag: Tag, state: unknown): void {
    const result = this.libRNOHApp?.updateState(instanceId, componentName, tag, state)
    return result
  }

  getInspectorWrapper(): InspectorInstance {
    return this.libRNOHApp?.getInspectorWrapper();
  }

  initializeArkTSBridge(handler: ArkTSBridgeHandler) {
    this.libRNOHApp?.initializeArkTSBridge({
      getDisplayMetrics: () => handler.getDisplayMetrics(),
      handleError: (errData: {
        message: string,
        stacktrace?: string[],
        suggestions?: string[]
      }) => {
        handler.handleError(new RNOHError({
          whatHappened: errData.message,
          howCanItBeFixed: (errData.suggestions ?? []),
          customStack: (errData.stacktrace ?? []).join("\n"),
        }))
      },
      getFoldStatus: () => handler.getFoldStatus(),
      getIsSplitScreenMode: () => handler.getIsSplitScreenMode(),
      getFontSizeScale: () => handler.getFontSizeScale()
    });
  }

  postMessageToCpp(name: string, payload: any) {
    const result = this.libRNOHApp?.onArkTSMessage(name, payload)
    return result
  }

  logMarker(markerId: string, rnInstanceId: number) {
    const result = this.libRNOHApp?.logMarker(markerId, rnInstanceId)
    return result
  }

  getNativeNodeIdByTag(instanceId: number, tag: Tag): string | undefined {
    const result = this.libRNOHApp?.getNativeNodeIdByTag(instanceId, tag)
    return result
  }
}
