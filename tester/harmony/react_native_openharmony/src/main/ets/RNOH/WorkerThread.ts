import worker from "@ohos.worker"

interface WorkerThreadDependencies {
  scriptUrl: string
  name: string
}

type WorkerThreadMessageListener = (string, unknown) => void

export class WorkerThread {
  static create({ scriptUrl, name }: WorkerThreadDependencies) {
    return new WorkerThread(new worker.ThreadWorker(scriptUrl, { name: name }))
  }

  private listeners: Set<WorkerThreadMessageListener> = new Set()

  private constructor(private rawWorkerThread: worker.ThreadWorker) {
    this.rawWorkerThread.onmessage = (ev) => {
      const messageType = ev.data?.type
      const messagePayload = ev.data?.payload
      if (messageType) {
        for (const listener of this.listeners) {
          listener(messageType, messagePayload)
        }
      }
    }
  }

  postMessage(type: string, payload: any = undefined) {
    this.rawWorkerThread.postMessage({type, payload})
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