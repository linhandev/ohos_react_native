import type { RNOHContext } from './RNOHContext';
import type { RNOHLogger } from "./RNOHLogger"

export type MainTurboModuleContext = RNOHContext;

export class MainTurboModule {
  public static readonly NAME;

  public constructor(protected ctx: MainTurboModuleContext) {
  };

  public __onDestroy__() {
  }
}

/**
 * @deprecated: Use MainTurboModuleContext or WorkerTurboModuleContext instead (latestRNOHVersion: 0.72.30)
 */
export type TurboModuleContext = MainTurboModuleContext

/**
 * @deprecated Use MainTurboModule or WorkerTurboModule instead (latestRNOHVersion: 0.72.30)
 */
export class TurboModule extends MainTurboModule {
}

export type WorkerTurboModuleContext = {
  logger: RNOHLogger
}

/**
 * @experimental
 */
export class WorkerTurboModule {
  public static readonly NAME;

  public constructor(protected ctx: WorkerTurboModuleContext) {
  };

  public __onDestroy__() {
  }
}