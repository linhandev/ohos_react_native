/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-ignore
import libRNOHApp from 'librnoh_app.so';
import type { TurboModuleProvider } from "./TurboModuleProvider";
import type { Mutation } from "./Mutation";
import type { Tag } from "./DescriptorBase";
import type { DisplayMode } from './CppBridgeUtils'
import { RNOHLogger } from "./RNOHLogger"
import type { DisplayMetrics, InspectorPackagerConnection, InspectorPackagerConnectionDelegate,
  JSEngineName } from './types'
import { FatalRNOHError, RNOHError } from "./RNOHError"
import type { FrameNodeFactory } from "./RNInstance"
import ohosResourceManager from '@ohos.resourceManager';
import {
  AnyThreadTurboModule,
  UITurboModule,
  WorkerTurboModule,
} from './TurboModule';
import { NodeContent } from '@ohos.arkui.node';
import { JsBundle } from './JSBundleProvider';


export type CppFeatureFlag = "PARTIAL_SYNC_OF_DESCRIPTOR_REGISTRY" | "WORKER_THREAD_ENABLED"

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
  getMetadata: (name: string) => string;
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
      jsEngineName: JSEngineName,
      envId: number
    }>(this.libRNOHApp?.onInit(shouldCleanUpRNInstances, {
      handleError: (err: RawRNOHError) => {
        arkTSBridgeHandler.handleError(new RNOHError({
          whatHappened: err.message,
          howCanItBeFixed: (err.suggestions ?? []),
          customStack: (err.stacktrace ?? []).join("\n"),
        }))
      },
      getDisplayMetrics: () => arkTSBridgeHandler.getDisplayMetrics(),
      getMetadata: (name: string) => arkTSBridgeHandler.getMetadata(name),
    } satisfies ArkTSBridgeHandler))
  }

  registerWorkerTurboModuleProvider(turboModuleProvider: TurboModuleProvider<WorkerTurboModule | AnyThreadTurboModule>,
    rnInstanceId: number) {
    return this.unwrapResult<undefined>(this.libRNOHApp?.registerWorkerTurboModuleProvider(turboModuleProvider,
      rnInstanceId))
  }

  getNextRNInstanceId(): number {
    return this.unwrapResult<number>(this.libRNOHApp?.getNextRNInstanceId());
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
    cppFeatureFlags: CppFeatureFlag[],
    resourceManager: ohosResourceManager.ResourceManager,
    fontPathByFontFamily: Record<string, string>
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
      shouldEnableDebugger,
      cppFeatureFlagStatusByName,
      frameNodeFactoryRef,
      resourceManager,
      envId,
      fontPathByFontFamily
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

  loadScript(instanceId: number, bundle: JsBundle, sourceURL: string): Promise<void> {
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
    surfaceMinWidth: number,
    surfaceMinHeight: number,
    surfaceMaxWidth: number,
    surfaceMaxHeight: number,
    surfaceOffsetX: number,
    surfaceOffsetY: number,
    pixelRatio: number,
    isRTL: boolean,
    initialProps: any) {
    const result = this.libRNOHApp?.startSurface(
      instanceId,
      surfaceTag,
      surfaceMinWidth,
      surfaceMinHeight,
      surfaceMaxWidth,
      surfaceMaxHeight,
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
    surfaceMinWidth: number,
    surfaceMinHeight: number,
    surfaceMaxWidth: number,
    surfaceMaxHeight: number,
    surfaceOffsetX: number,
    surfaceOffsetY: number,
    pixelRatio: number,
    isRTL: boolean,
  ) {
    const result = this.libRNOHApp?.updateSurfaceConstraints(
      instanceId,
      surfaceTag,
      surfaceMinWidth,
      surfaceMinHeight,
      surfaceMaxWidth,
      surfaceMaxHeight,
      surfaceOffsetX,
      surfaceOffsetY,
      pixelRatio,
      isRTL
    );
    return this.unwrapResult(result)
  }

  measureSurface(
    instanceId: number,
    surfaceTag: number,
    surfaceMinWidth: number,
    surfaceMinHeight: number,
    surfaceMaxWidth: number,
    surfaceMaxHeight: number,
    surfaceOffsetX: number,
    surfaceOffsetY: number,
    pixelRatio: number,
    isRTL: boolean,
  ) {
    const result = this.libRNOHApp?.measureSurface(
      instanceId,
      surfaceTag,
      surfaceMinWidth,
      surfaceMinHeight,
      surfaceMaxWidth,
      surfaceMaxHeight,
      surfaceOffsetX,
      surfaceOffsetY,
      pixelRatio,
      isRTL
    );
    return this.unwrapResult<{ width: number, height: number }>(result)
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
    let resolveWait = () => {
    }
    const wait = new Promise<void>((resolve) => {
      resolveWait = () => {
        resolve()
      }
    })
    const result = this.libRNOHApp?.stopSurface(
      instanceId,
      surfaceTag,
      () => resolveWait()
    );
    this.unwrapResult(result);
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

  getInspectorPackagerConnection(url: string, app: string,
    delegate: InspectorPackagerConnectionDelegate): InspectorPackagerConnection {
    return this.libRNOHApp!.getInspectorPackagerConnection(url, app, delegate);
  }

  getInspectorFlagIsFuseboxEnabled() {
    return this.libRNOHApp!.getInspectorFlagIsFuseboxEnabled();
  }

  postMessageToCpp(name: string, payload: any) {
    const result = this.libRNOHApp?.onArkTSMessage(name, payload)
    return this.unwrapResult(result)
  }

  logMarker(markerId: string, rnInstanceId: number) {
    const result = this.libRNOHApp?.logMarker(markerId, rnInstanceId)
    return this.unwrapResult(result)
  }

  getNativeNodeIdByTag(instanceId: number, tag: Tag): string | undefined {
    const result = this.libRNOHApp?.getNativeNodeIdByTag(instanceId, tag)
    return this.unwrapResult(result)
  }

  registerFont(instanceId: number, fontFamily: string, path: string) {
    return this.unwrapResult(this.libRNOHApp?.registerFont(instanceId, fontFamily, path));
  }

  attachRootView(instanceId: number, surfaceId: number, nodeContent: NodeContent) {
    const result = this.libRNOHApp?.attachRootView(instanceId, surfaceId, nodeContent)
    return this.unwrapResult(result);
  }

  detachRootView(instanceId: number, surfaceId: number) {
    const result = this.libRNOHApp?.detachRootView(instanceId, surfaceId)
    return this.unwrapResult(result);
  }
}
