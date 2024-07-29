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
  constructor(
    private id: number,
    private napiBridge: NapiBridge,
    private architecture: "ARK_TS" | "C_API",
    private getTurboModuleProvider: () => TurboModuleProvider<WorkerTurboModule, WorkerTurboModuleContext> | undefined
  ) {
  }

  emitDeviceEvent(eventName: string, payload: any): void {
    this.callRNFunction("RCTDeviceEventEmitter", "emit", [eventName, payload]);
  }

  callRNFunction(moduleName: string, functionName: string, args: unknown[]): void {
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
}

