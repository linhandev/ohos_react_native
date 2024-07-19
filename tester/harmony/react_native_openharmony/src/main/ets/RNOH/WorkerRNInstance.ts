import { NapiBridge } from "./NapiBridge"
import { RNInstance } from "./RNInstance"

/**
 * @api
 * @thread: WORKER
 */
export class WorkerRNInstance implements Partial<RNInstance> {
  constructor(private id: number, private napiBridge: NapiBridge) {
  }

  emitDeviceEvent(eventName: string, payload: any): void {
    this.callRNFunction("RCTDeviceEventEmitter", "emit", [eventName, payload]);
  }

  callRNFunction(moduleName: string, functionName: string, args: unknown[]): void {
    this.napiBridge.callRNFunction(this.id, moduleName, functionName, args)
  }
}

