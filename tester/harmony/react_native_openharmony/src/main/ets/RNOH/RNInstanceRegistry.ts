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
    private createRNOHContext: (rnInstance: RNInstance) => RNOHContext,
    private httpClientProvider: HttpClientProvider,
    private defaultHttpClient: HttpClient | undefined, // TODO: remove "undefined" when HttpClientProvider is removed
    private resourceManager: resourceManager.ResourceManager,
    private displayMetricsManager: DisplayMetricsManager,
    private workerThreadPromise: Promise<WorkerThread> | null,
  ) {
  }

  public async createInstance(options: RNInstanceOptions): Promise<RNInstance> {
    const id = this.napiBridge.getNextRNInstanceId();
    let workerThread: WorkerThread | null = null
    if (this.workerThreadPromise !== null) {
      workerThread = await this.workerThreadPromise
      await this.createRNInstanceEnvOnWorker(workerThread, id, options?.name)
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
      { concurrentRoot: options.disableConcurrentRoot !== undefined ? !options.disableConcurrentRoot : true },
      this.devToolsController,
      this.createRNOHContext,
      workerThread,
      options.enableDebugger ?? false,
      options.enableBackgroundExecutor ?? false,
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
    await rnInstance.initialize(options.createRNPackages({}));
    this.instanceMap.set(id, rnInstance);
    return rnInstance;
  }

  private async createRNInstanceEnvOnWorker(workerThread: WorkerThread, rnInstanceId: number, rnInstanceName: string) {
    const logger = this.logger.clone(["RNInstanceRegistry", "createRNInstanceEnvOnWorker"])
    logger.info("waiting for worker's rnInstance environment")
    setTimeout(() => {
      workerThread.postMessage("RNOH_CREATE_RN_INSTANCE_WORKER_ENV", {
        rnInstanceId, rnInstanceName, uiAbilityContext: this.uiAbilityContext
      })
    }, 0)
    await workerThread.waitForMessage("RNOH_CREATE_RN_INSTANCE_WORKER_ENV_ACK")
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
    this.unregisterMessageListeners.forEach(unregister => unregister())
  }
}
