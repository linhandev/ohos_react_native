import { ThreadWorkerGlobalScope } from "@ohos.worker"
import { RNOHLogger } from "./RNOHLogger"

export interface WorkerTurboModuleContext {
  workerPort: ThreadWorkerGlobalScope,
  logger: RNOHLogger,
}

export class WorkerTurboModule {
  constructor(private ctx: WorkerTurboModuleContext) {
  }
}