import { lang, worker, MessageEvents } from '@kit.ArkTS';
import {
  RNPackage,
  StandardRNOHLogger,
  TurboModuleProvider,
  NapiBridge,
  RNOHLogger,
  RNPackageContext,
  WorkerTurboModuleFactory,
  RNOHError
} from "./RNOH/ts"
import { RNOHCorePackage } from "./RNOHCorePackage/ts"
import { EtsWorkerTurboModuleContext, } from "./RNOH/EtsWorkerTurboModule"
import { UITaskRunner, UITask } from "./RNOH/UITaskRunner"


/**
 * @api: RN_APP_DEVELOPER
 */
interface RNOHWorkerConfig {
  thirdPartyPackagesFactoryByRNInstanceName?: Record<string, (ctx: RNPackageContext) => RNPackage[]>
  defaultThirdPartyPackagesFactory: (ctx: RNPackageContext) => RNPackage[]
}

interface CreateRNInstanceWorkerEnvPayload {
  rnInstanceName: string,
  rnInstanceId: number
}

interface TurboModuleUITaskResultPayload {
  taskId: string
  rnInstanceId: number
  result: Object
}

@Sendable
class UITaskMessagePayload {
  task: UITask
  rnInstanceId: number

  constructor(task: UITask, rnInstanceId: number) {
    this.task = task
    this.rnInstanceId = rnInstanceId
  }
}

@Sendable
class SendableMessage<TPayload extends lang.ISendable> {
  type: string;
  payload: TPayload;

  constructor(type: string, payload: TPayload) {
    this.type = type
    this.payload = payload
  }
}

@Sendable
class SendableRNOHError {
  message: string
  stack: string

  constructor(rnohError: RNOHError) {
    this.message = rnohError.getMessage();
    this.stack = rnohError.getStack() ?? ""
  }
}


/**
 * @api: RN_APP_DEVELOPER
 * @thread: WORKER
 */
export async function setupRNOHWorker(config: RNOHWorkerConfig) {
  const workerPort = worker.workerPort
  const logger = new StandardRNOHLogger().setThreadPrefix("___█_").clone(`setupRNOHWorker`)
  logger.info(`initializing`)
  const napiBridge = new NapiBridge(logger)
  const uiTaskRunnerByRNInstanceId = new Map<number, UITaskRunner>()


  const postMessage = (type: string, payload: Object | undefined = undefined) => {
    logger.debug(`postMessage: ${type}`)
    workerPort.postMessage({ type, payload })
  }

  workerPort.onmessage = (e: MessageEvents) => {
    try {
      const messageType = e.data?.type as string
      const messagePayload = e.data?.payload as Object
      if (messageType && typeof messageType === "string") {
        logger.debug(`receivedMessage: ${messageType}`)
        switch (messageType) {
          case "RNOH_WORKER_THREAD_READY":
            postMessage("RNOH_WORKER_THREAD_READY_ACK")
            break;
          case "RNOH_CREATE_RN_INSTANCE_WORKER_ENV":
            const typedMessagePayload = messagePayload as CreateRNInstanceWorkerEnvPayload
            const rnInstanceName = typedMessagePayload.rnInstanceName;
            const rnInstanceId = typedMessagePayload.rnInstanceId;
            if (uiTaskRunnerByRNInstanceId.has(rnInstanceId)) {
              throw new RNOHError({ whatHappened: `Tried to re-create UITaskRunner (rnInstanceId=${rnInstanceId})`, howCanItBeFixed: []})
            }
            const uiTaskRunner = new UITaskRunner(rnInstanceId.toString(), (uiTask) => {
              workerPort.postMessageWithSharedSendable(new SendableMessage("RNOH_TURBO_MODULE_UI_TASK", new UITaskMessagePayload(uiTask, rnInstanceId)));
            })
            uiTaskRunnerByRNInstanceId.set(rnInstanceId, uiTaskRunner)
            let createPackages: (ctx: RNPackageContext) => RNPackage[] = (ctx: RNPackageContext) => []
            if (rnInstanceName === undefined || config.thirdPartyPackagesFactoryByRNInstanceName === undefined ||
              !(Object.keys(config.thirdPartyPackagesFactoryByRNInstanceName)
                .includes(rnInstanceName))) {
              createPackages = config.defaultThirdPartyPackagesFactory
            } else {
              createPackages = config.thirdPartyPackagesFactoryByRNInstanceName[rnInstanceName]
            }
            const packages = createPackages({})
            createTurboModuleProvider(uiTaskRunner, packages, logger).then((turboModuleProvider) => {
              napiBridge.registerWorkerTurboModuleProvider(turboModuleProvider, rnInstanceId)
              logger.info("registered WorkerTurboModuleProvider")
              postMessage("RNOH_CREATE_RN_INSTANCE_WORKER_ENV_ACK")
            })
            break;
          case "RNOH_TURBO_MODULE_UI_TASK_RESULT":
            const taskResultMessagePayload = messagePayload as TurboModuleUITaskResultPayload
            if (!uiTaskRunnerByRNInstanceId.has(taskResultMessagePayload.rnInstanceId)) {
              throw new RNOHError({
                whatHappened: "Received UI Task result but UITaskRunner isn't created",
                howCanItBeFixed: []
              })
            }
            uiTaskRunnerByRNInstanceId.get(taskResultMessagePayload.rnInstanceId)!.resolve(taskResultMessagePayload.taskId, taskResultMessagePayload.result as lang.ISendable)
            break;
        }
      }
    } catch (err) {
      if (err instanceof RNOHError) {
        logger.error(err)
        workerPort.postMessageWithSharedSendable(new SendableMessage("RNOH_ERROR", new SendableRNOHError(err)))
        return;
      } else {
        throw (err as Error);
      }
    }
  }
}

async function createTurboModuleProvider(uiTaskRunner: UITaskRunner, thirdPartyPackages: RNPackage[],
  logger: RNOHLogger) {
  const packages = [...thirdPartyPackages]
  packages.unshift(new RNOHCorePackage({}));
  const factories = await Promise.all(packages.map(async (pkg, idx) => {
    const pkgDebugName = pkg.getDebugName()
    let loggerName = `package${idx + 1}`
    if (pkgDebugName) {
      loggerName += `: ${pkgDebugName}`
    }
    logger.clone(loggerName).debug("")
    const etsWorkerTurboModuleContext = new EtsWorkerTurboModuleContext({ logger }, uiTaskRunner)
    const turboModuleFactory = pkg.createWorkerTurboModuleFactory(etsWorkerTurboModuleContext);
    if (turboModuleFactory != null) {
      await turboModuleFactory.prepareEagerTurboModules()
    }
    return turboModuleFactory
  }));
  return new TurboModuleProvider(
    factories.filter(tmf => tmf != null) as WorkerTurboModuleFactory[],
    logger
  )
}
