import worker from "@ohos.worker"
import { RNOHLogger } from "./RNOHLogger"
import { RNOHError } from "./RNOHError"

interface WorkerThreadDependencies {
  scriptUrl: string
  name: string
  logger: RNOHLogger
  onWorkerError: (rnohError: RNOHError) => void
}

type WorkerThreadMessageListener = (string, unknown) => void

/**
 * @internal
 */
export class WorkerThread {
  static async create({ scriptUrl, name, logger, onWorkerError }: WorkerThreadDependencies) {
    const workerThread = new WorkerThread(logger, new worker.ThreadWorker(scriptUrl, { name: name }), onWorkerError)
    const interval = setInterval(() => {
      workerThread.postMessage("RNOH_WORKER_THREAD_READY")
    }, 100);
    setTimeout(() => {
      workerThread.postMessage("RNOH_WORKER_THREAD_READY")
    }, 0)
    await workerThread.waitForMessage("RNOH_WORKER_THREAD_READY_ACK")
    clearInterval(interval)
    return workerThread;
  }

  private logger: RNOHLogger
  private listeners: Set<WorkerThreadMessageListener> = new Set()

  private constructor(logger: RNOHLogger, private rawWorkerThread: worker.ThreadWorker,
    private onWorkerError: (rnohError: RNOHError) => void) {
    this.logger = logger.clone("WorkerThread")
    this.rawWorkerThread.onmessage = (ev) => {
      const messageType = ev.data?.type
      const messagePayload = ev.data?.payload
      if (messageType) {
        this.logger.clone("receivedMessage").debug(messageType)
        for (const listener of this.listeners) {
          listener(messageType, messagePayload)
        }
      }
    }
    this.listeners.add((type, payload) => {
      if (type === "RNOH_ERROR") {
        this.onWorkerError(new RNOHError({
          whatHappened: payload.message,
          howCanItBeFixed: [],
          customStack: payload.stack
        }))
      }
    })
  }

  postMessage(type: string, payload: any = undefined) {
    this.logger.clone("postMessage").debug(type)
    this.rawWorkerThread.postMessage({ type, payload })
  }

  async waitForMessage(expectedMsgType: string) {
    return new Promise(resolve => {
      const unsubscribe = this.subscribeToMessages((type) => {
        if (type === expectedMsgType) {
          resolve(undefined)
          unsubscribe()
        }
      })
    })
  }

  subscribeToMessages(listener: WorkerThreadMessageListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  destroy() {
    this.listeners.clear()
    this.rawWorkerThread.terminate()
  }
}