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
import { WorkerTurboModule, WorkerTurboModuleContext } from './TurboModule';


export type CppFeatureFlag = "ENABLE_NDK_TEXT_MEASURING" | "C_API_ARCH" | "PARTIAL_SYNC_OF_DESCRIPTOR_REGISTRY" | "WORKER_THREAD_ENABLED"

type RawRNOHError = {
  message: string,
  stacktrace?: string[],
  suggestions?: string[]
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
}

export class NapiBridge {
  private logger: RNOHLogger
  private libRNOHApp: any

  constructor(logger: RNOHLogger) {
    this.libRNOHApp = libRNOHApp;
    this.logger = logger.clone("NapiBridge")
  }

  private unwrapResult<TOk = null>(result: Result<TOk>): TOk {
    if (result.err) {
      throw this.unwrapError(result)
    }
    return result.ok
  }

  private unwrapError(result: Result<unknown>): RNOHError {
    if (!result.err) {
      throw new RNOHError({
        whatHappened: "Called unwrapError on result which doesn't have error",
        howCanItBeFixed: []
      })
    }
    return new RNOHError({
      whatHappened: result.err.message,
      howCanItBeFixed: (result.err.suggestions ?? []),
      customStack: (result.err.stacktrace ?? []).join("\n"),
    })
  }

  onInit(shouldCleanUpRNInstances: boolean, arkTSBridgeHandler: ArkTSBridgeHandler) {
    if (!this.libRNOHApp) {
      const err = new FatalRNOHError({
        whatHappened: "Couldn't create bindings between ETS and CPP. libRNOHApp is undefined.",
        howCanItBeFixed: []
      })
      this.logger.fatal(err)
      throw err
    }
    return this.unwrapResult<{
      isDebugModeEnabled: boolean,
      envId: number
    }>(this.libRNOHApp?.onInit(shouldCleanUpRNInstances, {
      handleError: (err: RawRNOHError) => {
        arkTSBridgeHandler.handleError(new RNOHError({
          whatHappened: err.message,
          howCanItBeFixed: (err.suggestions ?? []),
          customStack: (err.stacktrace ?? []).join("\n"),
        }))
      },
      getDisplayMetrics: () => arkTSBridgeHandler.getDisplayMetrics()
    } satisfies ArkTSBridgeHandler))
  }

  registerWorkerTurboModuleProvider(turboModuleProvider: TurboModuleProvider<WorkerTurboModule, WorkerTurboModuleContext>, rnInstanceId: number) {
    return this.unwrapResult<undefined>(this.libRNOHApp?.registerWorkerTurboModuleProvider(turboModuleProvider, rnInstanceId))
  }

  getNextRNInstanceId(): number {
    return this.unwrapResult<number>(this.libRNOHApp?.getNextRNInstanceId());
  }

  onCreateRNInstance(
    envId: number,
    instanceId: number,
    turboModuleProvider: TurboModuleProvider,
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
      envId,
      fontFamilyNameByFontPathRelativeToRawfileDir
    );
    return this.unwrapResult(result)
  }

  onDestroyRNInstance(instanceId: number) {
    return this.unwrapResult(this.libRNOHApp?.onDestroyRNInstance(instanceId))
  }

  emitComponentEvent(instanceId: number, tag: Tag, eventEmitRequestHandlerName: string, payload: any) {
    return this.unwrapResult(this.libRNOHApp?.emitComponentEvent(instanceId, tag, eventEmitRequestHandlerName,
      payload));
  }

  loadScript(instanceId: number, bundle: ArrayBuffer, sourceURL: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const result = this.libRNOHApp?.loadScript(instanceId, bundle, sourceURL, (errorMsg: string) => {
        errorMsg ? reject(new Error(errorMsg)) : resolve()
      }) as Result<null>;
      if (result.err) {
        reject(this.unwrapError(result))
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
    return this.unwrapResult(result)
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
    return this.unwrapResult(result)
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
    return this.unwrapResult(result)
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
    return this.unwrapResult(result);
  }

  async stopSurface(
    instanceId: number,
    surfaceTag: number,
  ) {
    const result = this.libRNOHApp?.stopSurface(
      instanceId,
      surfaceTag
    );
    return this.unwrapResult(result)
  }

  async destroySurface(
    instanceId: number,
    surfaceTag: number,
  ) {
    const result = this.libRNOHApp?.destroySurface(
      instanceId,
      surfaceTag
    );
    return this.unwrapResult(result)
  }

  setSurfaceDisplayMode(instanceId: number, surfaceTag: Tag, displayMode: DisplayMode): void {
    const result = this.libRNOHApp?.setSurfaceDisplayMode(instanceId, surfaceTag, displayMode);
    return this.unwrapResult(result)
  }

  callRNFunction(instanceId: number, moduleName: string, functionName: string, args: unknown[]): void {
    const result = this.libRNOHApp?.callRNFunction(instanceId, moduleName, functionName, args);
    return this.unwrapResult(result)
  }

  onMemoryLevel(level: number): void {
    const result = this.libRNOHApp?.onMemoryLevel(level)
    return this.unwrapResult(result)
  }

  updateState(instanceId: number, componentName: string, tag: Tag, state: unknown): void {
    const result = this.libRNOHApp?.updateState(instanceId, componentName, tag, state)
    return this.unwrapResult(result)
  }

  getInspectorWrapper(): InspectorInstance {
    return this.libRNOHApp?.getInspectorWrapper();
  }

  postMessageToCpp(name: string, payload: any) {
    const result = this.libRNOHApp?.onArkTSMessage(name, payload)
    return this.unwrapResult(result)
  }

  getNativeNodeIdByTag(instanceId: number, tag: Tag): string | undefined {
    const result = this.libRNOHApp?.getNativeNodeIdByTag(instanceId, tag)
    return this.unwrapResult(result)
  }
}
