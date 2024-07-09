import { worker } from '@kit.ArkTS';
import { MessageEvents } from '@kit.ArkTS';
import { RNPackage, StandardRNOHLogger, TurboModuleProvider, NapiBridge, RNOHLogger, RNPackageContext } from "./RNOH/ts"
import { RNOHCorePackage } from "./RNOHCorePackage/ts"

/**
 * @api: RN_APP_DEVELOPER
 */
interface RNOHWorkerConfig {
  thirdPartyPackagesFactoryByRNInstanceName?: Record<string, (ctx: RNPackageContext) => RNPackage[]>
  defaultThirdPartyPackagesFactory: (ctx: RNPackageContext) => RNPackage[]
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

  const postMessage = (type: string, payload: any = undefined) => {
    logger.info(`postMessage: ${type}`)
    workerPort.postMessage({ type, payload })
  }

  workerPort.onmessage = (e: MessageEvents) => {
    const messageType = e.data?.type
    const messagePayload = e.data?.payload
    if (messageType && typeof messageType === "string") {
      logger.info(`receivedMessage: ${messageType}`)
      switch (messageType) {
        case "RNOH_WORKER_THREAD_READY":
          postMessage("RNOH_WORKER_THREAD_READY_ACK")
          break;
        case "RNOH_CREATE_RN_INSTANCE_WORKER_ENV":
          const {rnInstanceName, rnInstanceId } = messagePayload
          let createPackages = (ctx: RNPackageContext) => []
          if (rnInstanceName === undefined || config.thirdPartyPackagesFactoryByRNInstanceName === undefined || !(rnInstanceName in config.thirdPartyPackagesFactoryByRNInstanceName)) {
            createPackages = config.defaultThirdPartyPackagesFactory
          } else {
            createPackages = config.thirdPartyPackagesFactoryByRNInstanceName[rnInstanceName]
          }
          const packages = createPackages({})
          createTurboModuleProvider(packages, logger).then((turboModuleProvider) => {
            napiBridge.registerWorkerTurboModuleProvider(turboModuleProvider, rnInstanceId)
            logger.info("registered WorkerTurboModuleProvider")
            postMessage("RNOH_CREATE_RN_INSTANCE_WORKER_ENV_ACK")
          })
          break;
      }
    }
  }
}

async function createTurboModuleProvider(rnPackages: RNPackage[], logger: RNOHLogger) {
  const packages = [...rnPackages]
  packages.unshift(new RNOHCorePackage({}));
  return new TurboModuleProvider(
    await Promise.all(rnPackages.map(async (pkg, idx) => {
      const pkgDebugName = pkg.getDebugName()
      let loggerName = `package${idx + 1}`
      if (pkgDebugName) {
        loggerName += `: ${pkgDebugName}`
      }
      logger.clone(loggerName).debug("")
      const turboModuleFactory = pkg.createWorkerTurboModuleFactory({ logger });
      await turboModuleFactory.prepareEagerTurboModules()
      return turboModuleFactory
    }).filter(tmf => tmf != null)),
    logger
  )
}