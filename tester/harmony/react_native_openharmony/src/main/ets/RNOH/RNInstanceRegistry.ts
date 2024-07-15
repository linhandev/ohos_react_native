import font from '@ohos.font';
import type { RNInstance, RNInstanceOptions } from './RNInstance';
import { RNInstanceImpl } from './RNInstance';
import type { NapiBridge } from './NapiBridge';
import type { RNOHContext } from './RNOHContext';
import type { RNOHLogger } from './RNOHLogger';
import type { DevToolsController } from './DevToolsController';
import { HttpClientProvider } from './HttpClientProvider';
import { HttpClient } from '../HttpClient/ts';
import { DisplayMetricsManager } from "./DisplayMetricsManager"
import resourceManager from '@ohos.resourceManager';
import { WorkerThread } from "./WorkerThread"

export class RNInstanceRegistry {
  private instanceMap: Map<number, RNInstanceImpl> = new Map();
  private unregisterMessageListener = () => {
  }

  constructor(
    private envId: number,
    private logger: RNOHLogger,
    private napiBridge: NapiBridge,
    private devToolsController: DevToolsController,
    private createRNOHContext: (rnInstance: RNInstance) => RNOHContext,
    private httpClientProvider: HttpClientProvider,
    private defaultHttpClient: HttpClient | undefined, // TODO: remove "undefined" when HttpClientProvider is removed
    private resourceManager: resourceManager.ResourceManager,
    private displayMetricsManager: DisplayMetricsManager,
    private workerThread: WorkerThread | null,
  ) {
  }

  public async createInstance(options: RNInstanceOptions): Promise<RNInstance> {
    const id = this.napiBridge.getNextRNInstanceId();
    if (this.workerThread !== null) {
      await this.waitForWorkerThread(id, options?.name)
    }
    const fontFamilyNameByFontPathRelativeToRawfileDir: Record<string, string> = {}
    for (const [fontFamily, fontResource] of Object.entries(options.fontResourceByFontFamily ?? {})) {
      fontFamilyNameByFontPathRelativeToRawfileDir[fontFamily] = fontResource.params[0]
      font.registerFont({ familyName: fontFamily, familySrc: fontResource })
    }
    const instance = new RNInstanceImpl(
      this.envId,
      id,
      this.logger,
      this.napiBridge,
      { concurrentRoot: options.disableConcurrentRoot !== undefined ? !options.disableConcurrentRoot : true },
      this.devToolsController,
      this.createRNOHContext,
      this.workerThread !== null, /* shouldUseWorkerThread */
      options.enableDebugger ?? false,
      options.enableBackgroundExecutor ?? false,
      options.enableNDKTextMeasuring ?? false,
      options.enableImageLoader ?? false,
      options.enableCAPIArchitecture ?? false,
      options?.enablePartialSyncOfDescriptorRegistryInCAPI ?? false,
      options.assetsDest,
      this.resourceManager,
      this.displayMetricsManager,
      fontFamilyNameByFontPathRelativeToRawfileDir,
      this.httpClientProvider,
      options?.httpClient ?? this.defaultHttpClient,
      options.backPressHandler,
    );
    await instance.initialize(options.createRNPackages({}));
    this.instanceMap.set(id, instance);
    return instance;
  }

  private async waitForWorkerThread(rnInstanceId: number, rnInstanceName: string) {
    const logger = this.logger.clone(["RNInstanceRegistry", "waitForWorkerThread"])
    let resolveWorkerTurboModuleProviderRegisteredPromise = (value: undefined) => undefined
    const workerTurboModuleProviderRegisteredPromise = new Promise((resolve) => {
      resolveWorkerTurboModuleProviderRegisteredPromise = resolve
    })

    const postMessage = (type: string, payload: any = undefined) => {
      logger.info(`postMessage: ${type}`)
      this.workerThread.postMessage(type, payload)
    }

    logger.info("waiting for worker readiness")
    await new Promise((resolve) => {
      const readinessProb = setInterval(() => postMessage("RNOH_WORKER_THREAD_READY"), 100);
      this.unregisterMessageListener = this.workerThread.subscribeToMessages((type, payload) => {
        logger.info(`receivedMessage: ${type}`)
        if (type === "RNOH_WORKER_THREAD_READY_ACK") {
          clearInterval(readinessProb);
          resolve(undefined)
        } else if (type === "RNOH_CREATE_RN_INSTANCE_WORKER_ENV_ACK") {
          resolveWorkerTurboModuleProviderRegisteredPromise(undefined)
        }
      })

    })

    postMessage("RNOH_CREATE_RN_INSTANCE_WORKER_ENV", {
      rnInstanceId, rnInstanceName
    })
    logger.info("waiting for workerTurboModuleProvider")
    await workerTurboModuleProviderRegisteredPromise;
  }

  public getInstance(id: number): RNInstance {
    return this.instanceMap.get(id);
  }

  public deleteInstance(id: number): boolean {
    if (this.instanceMap.has(id)) {
      this.instanceMap.delete(id);
      return true;
    }
    return false;
  }

  public forEach(cb: (rnInstance: RNInstanceImpl) => void) {
    this.instanceMap.forEach(cb);
  }

  onDestroy() {
    this.unregisterMessageListener()
  }
}
