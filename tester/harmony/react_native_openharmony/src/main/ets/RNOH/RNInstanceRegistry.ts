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
import { RNOHError } from "./RNOHError"
import common from '@ohos.app.ability.common'

export class RNInstanceRegistry {
  private instanceMap: Map<number, RNInstanceImpl> = new Map();
  private unregisterMessageListeners: (() => void)[] = []

  constructor(
    private uiAbilityContext: common.UIAbilityContext,
    private envId: number,
    private logger: RNOHLogger,
    private napiBridge: NapiBridge,
    private devToolsController: DevToolsController,
    private createRNOHContext: (rnInstance: RNInstanceImpl) => RNOHContext,
    private httpClientProvider: HttpClientProvider,
    private defaultHttpClient: HttpClient | undefined, // TODO: remove "undefined" when HttpClientProvider is removed
    private resourceManager: resourceManager.ResourceManager,
    private displayMetricsManager: DisplayMetricsManager,
    private workerThreadPromise: Promise<WorkerThread> | null,
  ) {
  }

  public async createInstance(options: RNInstanceOptions): Promise<RNInstance> {
    const id = this.napiBridge.getNextRNInstanceId();
    if (options.enableBackgroundExecutor) {
      this.logger.warn("'enableBackgroundExecutor' feature flag is deprecated");
    }
    let workerThread: WorkerThread | null = null
    if (this.workerThreadPromise !== null) {
      workerThread = await this.workerThreadPromise
      await this.createRNInstanceEnvOnWorker(workerThread, id, options?.name)
    }
    if (options.enableCAPIArchitecture && !options.fontResourceByFontFamily) {
      this.logger.warn("No custom fonts registered");
    }
    const fontFamilyNameByFontPathRelativeToRawfileDir: Record<string, string> = {}
    for (const [fontFamily, fontResource] of Object.entries(options.fontResourceByFontFamily ?? {})) {
      fontFamilyNameByFontPathRelativeToRawfileDir[fontFamily] = fontResource.params[0]
      font.registerFont({ familyName: fontFamily, familySrc: fontResource })
    }
    const rnInstance = new RNInstanceImpl(
      this.envId,
      id,
      this.logger,
      this.napiBridge,
      this.getDefaultProps(),
      { concurrentRoot: options.disableConcurrentRoot !== undefined ? !options.disableConcurrentRoot : true },
      this.devToolsController,
      this.createRNOHContext,
      workerThread,
      options.enableDebugger ?? false,
      options.enableBackgroundExecutor ?? false,
      options.enableNDKTextMeasuring ?? false,
      options.enableImageLoader ?? false,
      options.enableCAPIArchitecture ?? false,
      options.assetsDest,
      this.resourceManager,
      this.displayMetricsManager,
      options.arkTsComponentNames,
      fontFamilyNameByFontPathRelativeToRawfileDir,
      this.httpClientProvider,
      options?.httpClient ?? this.defaultHttpClient,
      options.backPressHandler,
    );
    await rnInstance.initialize(options.createRNPackages({}));
    this.instanceMap.set(id, rnInstance);
    return rnInstance;
  }

  private async createRNInstanceEnvOnWorker(workerThread: WorkerThread, rnInstanceId: number, rnInstanceName: string) {
    const logger = this.logger.clone(["RNInstanceRegistry", "createRNInstanceEnvOnWorker"])
    logger.info("waiting for worker's rnInstance environment")
    setTimeout(() => {
      workerThread.postMessage("RNOH_CREATE_WORKER_RN_INSTANCE", {
        rnInstanceId, rnInstanceName, uiAbilityContext: this.uiAbilityContext
      })
    }, 0)
    await workerThread.waitForMessage("RNOH_CREATE_WORKER_RN_INSTANCE_ACK",
      (payload) => payload.rnInstanceId === rnInstanceId)
  }

  public getInstance(id: number): RNInstance {
    return this.instanceMap.get(id);
  }

  public async deleteInstance(id: number): Promise<boolean> {
    if (this.instanceMap.has(id)) {
      this.instanceMap.delete(id);
      if (this.workerThreadPromise) {
        const worker = await this.workerThreadPromise;
        const ack = worker.waitForMessage("RNOH_DESTROY_WORKER_RN_INSTANCE_ACK", (payload) => payload.rnInstanceId === id)
        worker.postMessage("RNOH_DESTROY_WORKER_RN_INSTANCE", {rnInstanceId: id})
        await ack;
      }
      return true;
    }
    return false;
  }

  public forEach(cb: (rnInstance: RNInstanceImpl) => void) {
    this.instanceMap.forEach(cb);
  }

  private getDefaultProps(): Record<string, any> {
    return { concurrentRoot: true };
  }

  onDestroy() {
    this.unregisterMessageListeners.forEach(unregister => unregister())
  }
}
