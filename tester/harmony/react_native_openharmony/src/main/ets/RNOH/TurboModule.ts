export { UITurboModuleContext, TurboModuleContext, WorkerTurboModuleContext } from './RNOHContext';

import { UITurboModuleContext, WorkerTurboModuleContext } from './RNOHContext';


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
 * @deprecated Use UITurboModule or WorkerTurboModule instead (latestRNOHVersion: 0.72.30)
 */
export class TurboModule extends UITurboModule {
}


/**
 * @api
 * @thread: WORKER
 */
export class WorkerTurboModule {
  public static readonly NAME;

  public constructor(protected ctx: WorkerTurboModuleContext) {
  };

  public __onDestroy__() {
  }
}