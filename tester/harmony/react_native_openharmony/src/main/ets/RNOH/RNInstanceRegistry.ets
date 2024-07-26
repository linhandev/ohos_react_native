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
import { RNOHCorePackage } from '../RNOHCorePackage/Package'

const DEFAULT_ASSETS_DEST: string = "assets/"; // assets destination path "assets/subpath/"

interface CreateWorkerRNInstanceAckPayload {
  rnInstanceId: number
}

interface DestroyWorkerRNInstanceAckPayload {
  rnInstanceId: number
}

export class RNInstanceRegistry {
  private instanceMap: Map<number, RNInstanceImpl> = new Map();
  private unregisterMessageListeners: (() => void)[] = []
  private uiAbilityContext: common.UIAbilityContext
  private envId: number
  private logger: RNOHLogger
  private napiBridge: NapiBridge
  private devToolsController: DevToolsController
  private createRNOHContext: (rnInstance: RNInstanceImpl) => RNOHContext
  private httpClientProvider: HttpClientProvider
  private defaultHttpClient: HttpClient | undefined
  private resourceManager: resourceManager.ResourceManager
  private displayMetricsManager: DisplayMetricsManager
  private workerThreadPromise: Promise<WorkerThread>

  constructor(
    uiAbilityContext: common.UIAbilityContext,
    envId: number,
    logger: RNOHLogger,
    napiBridge: NapiBridge,
    devToolsController: DevToolsController,
    createRNOHContext: (rnInstance: RNInstanceImpl) => RNOHContext,
    httpClientProvider: HttpClientProvider,
    defaultHttpClient: HttpClient | undefined, // TODO: remove "undefined" when HttpClientProvider is removed
    resourceManager: resourceManager.ResourceManager,
    displayMetricsManager: DisplayMetricsManager,
    workerThreadPromise: Promise<WorkerThread>,
  ) {
    this.uiAbilityContext = uiAbilityContext
    this.envId = envId
    this.logger = logger
    this.napiBridge = napiBridge
    this.devToolsController = devToolsController
    this.createRNOHContext = createRNOHContext
    this.httpClientProvider = httpClientProvider
    this.defaultHttpClient = defaultHttpClient
    this.resourceManager = resourceManager
    this.displayMetricsManager = displayMetricsManager
    this.workerThreadPromise = workerThreadPromise
  }

  public async createInstance(options: RNInstanceOptions): Promise<RNInstance> {
    const id = this.napiBridge.getNextRNInstanceId();
    const workerThread = await this.workerThreadPromise
    await this.createRNInstanceEnvOnWorker(workerThread, id, options)
    const fontFamilyNameByFontPathRelativeToRawfileDir: Record<string, string> = {}
    for (const fontFamilyAndResource of Object.entries(options.fontResourceByFontFamily ?? {})) {
      const fontFamily = fontFamilyAndResource[0]
      const fontResource = fontFamilyAndResource[1]
      fontFamilyNameByFontPathRelativeToRawfileDir[fontFamily] = fontResource.params![0]
      font.registerFont({ familyName: fontFamily, familySrc: fontResource })
    }
    const rnInstance = new RNInstanceImpl(
      this.envId,
      id,
      this.logger,
      this.napiBridge,
      options.disableConcurrentRoot,
      this.devToolsController,
      this.createRNOHContext,
      workerThread,
      options.enableDebugger ?? false,
      options.enableBackgroundExecutor ?? false,
      options.enableImageLoader ?? false,
      options.enableCAPIArchitecture ?? false,
      options?.enablePartialSyncOfDescriptorRegistryInCAPI ?? false,
      options.assetsDest ?? DEFAULT_ASSETS_DEST,
      this.resourceManager,
      this.displayMetricsManager,
      fontFamilyNameByFontPathRelativeToRawfileDir,
      this.httpClientProvider,
      options?.httpClient ?? this.defaultHttpClient,
      options.backPressHandler ?? (() => {
      }),
    );
    const packages = options.createRNPackages({})
    packages.unshift(new RNOHCorePackage({}));
    await rnInstance.initialize(packages);
    this.instanceMap.set(id, rnInstance);
    return rnInstance;
  }

  private async createRNInstanceEnvOnWorker(workerThread: WorkerThread, rnInstanceId: number,
    options: RNInstanceOptions) {
    const logger = this.logger.clone(["RNInstanceRegistry", "createRNInstanceEnvOnWorker"])
    logger.info("waiting for worker's rnInstance environment")
    setTimeout(() => {
      workerThread.postMessage("RNOH_CREATE_WORKER_RN_INSTANCE", {
        rnInstanceId,
        rnInstanceName: options.name,
        uiAbilityContext: this.uiAbilityContext,
        architecture: options.enableCAPIArchitecture ? "C_API" : "ARK_TS"
      })
    }, 0)
    await workerThread.waitForMessage("RNOH_CREATE_WORKER_RN_INSTANCE_ACK",
      (payload: CreateWorkerRNInstanceAckPayload) => payload.rnInstanceId === rnInstanceId)
  }

  public getInstance(id: number): RNInstance {
    return this.instanceMap.get(id)!;
  }

  public async deleteInstance(id: number): Promise<boolean> {
    if (this.instanceMap.has(id)) {
      this.instanceMap.delete(id);
      const worker = await this.workerThreadPromise;
      const ack =
        worker.waitForMessage("RNOH_DESTROY_WORKER_RN_INSTANCE_ACK",
          (payload: DestroyWorkerRNInstanceAckPayload) => payload.rnInstanceId === id)
      worker.postMessage("RNOH_DESTROY_WORKER_RN_INSTANCE", { rnInstanceId: id })
      await ack;
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
