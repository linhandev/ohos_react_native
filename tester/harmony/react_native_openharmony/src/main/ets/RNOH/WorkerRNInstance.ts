import type { NapiBridge } from "./NapiBridge"
import type { RNInstance } from "./RNInstance"
import { RNOHError } from './RNOHError'
import type { WorkerTurboModule, WorkerTurboModuleContext } from "./TurboModule"
import type { TurboModuleProvider } from "./TurboModuleProvider"


/**
 * @api
 * @thread: WORKER
 */
export class WorkerRNInstance implements Partial<RNInstance> {
  protected canCallRNFunction = false;
  protected rnFunctionCallsQueue: {
    moduleName: string,
    functionName: string,
    args: unknown[]
  }[] = []

  constructor(
    protected id: number,
    protected napiBridge: NapiBridge,
    protected architecture: "ARK_TS" | "C_API",
    protected assetsDest: string,
    protected getTurboModuleProvider: () => TurboModuleProvider<WorkerTurboModule, WorkerTurboModuleContext> | undefined
  ) {
  }

  emitDeviceEvent(eventName: string, payload: any): void {
    this.callRNFunction("RCTDeviceEventEmitter", "emit", [eventName, payload]);
  }

  callRNFunction(moduleName: string, functionName: string, args: unknown[]): void {
    if (!this.canCallRNFunction) {
      this.rnFunctionCallsQueue.push({ moduleName, functionName, args })
      return;
    }
    this.napiBridge.callRNFunction(this.id, moduleName, functionName, args)
  }

  postMessageToCpp(name: string, payload: any): void {
    this.napiBridge.postMessageToCpp(name, { rnInstanceId: this.id, payload });
  }

  getArchitecture() {
    return this.architecture
  }

  getWorkerTurboModule<T extends WorkerTurboModule>(name: string): T {
    const tmProvider = this.getTurboModuleProvider();
    if (!tmProvider) {
      throw new RNOHError({
        whatHappened: "TurboModuleProvider is undefined. This should never happen.",
        howCanItBeFixed: []
      })
    }
    return tmProvider.getModule<T>(name)
  }

  getAssetsDest(): string {
    return this.assetsDest
  }
}

/**
 * @internal
 */
export class WorkerRNInstanceInternal extends WorkerRNInstance {
  flushRNFunctionCalls() {
    this.rnFunctionCallsQueue.forEach(({ moduleName, functionName, args }) => {
      this.napiBridge.callRNFunction(this.id, moduleName, functionName, args)
    })
    this.rnFunctionCallsQueue = []
    this.canCallRNFunction = true;
  }
}