import type { RNOHContext } from './RNOHContext';
import type { RNOHLogger } from "./RNOHLogger"

/**
 * @api
 */
export type UITurboModuleContext = RNOHContext;

/**
 * @thread: MAIN
 * @api
 */
export class UITurboModule {
  public static readonly NAME;

  public constructor(protected ctx: UITurboModuleContext) {
  };

  public __onDestroy__() {
  }
}

/**
 * @api
 * @deprecated: Use UITurboModuleContext or WorkerTurboModuleContext instead (latestRNOHVersion: 0.72.30)
 */
export type TurboModuleContext = UITurboModuleContext

/**
 * @api
 * @deprecated Use UITurboModule or WorkerTurboModule instead (latestRNOHVersion: 0.72.30)
 */
export class TurboModule extends UITurboModule {
}

/**
 * @api
 */
export type WorkerTurboModuleContext = {
  logger: RNOHLogger
}

/**
 * @api
 * @experimental
 * @thread: WORKER
 */
export class WorkerTurboModule {
  public static readonly NAME;

  public constructor(protected ctx: WorkerTurboModuleContext) {
  };

  public __onDestroy__() {
  }
}