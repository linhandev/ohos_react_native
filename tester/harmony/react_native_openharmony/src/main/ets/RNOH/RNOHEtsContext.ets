import type { lang } from '@kit.ArkTS';
import { WorkerTurboModuleContext } from "./RNOHContext"
import type { SupportedUITaskParams, UITaskRunnable, UITaskRunner } from "./UITaskRunner"
import type { WorkerTurboModuleContextDependencies } from "./RNOHContext"

/**
 * @internal
 */
export interface EtsWorkerTurboModuleContextDependencies {
  workerTurboModuleContextDependencies: WorkerTurboModuleContextDependencies
  uiTaskRunner: UITaskRunner
}

/**
 * @api
 */
export class EtsWorkerTurboModuleContext extends WorkerTurboModuleContext {
  private deps: EtsWorkerTurboModuleContextDependencies

  /**
   * @internal
   */
  constructor(deps: EtsWorkerTurboModuleContextDependencies) {
    super(deps.workerTurboModuleContextDependencies)
    this.deps = deps
  }

  async runOnUIThread<TParams extends SupportedUITaskParams, TResult extends lang.ISendable | void, TRunnable extends UITaskRunnable<TParams, TResult>>(runnable: TRunnable,
    params: TParams): Promise<TResult> {
    return this.deps.uiTaskRunner.run(runnable, params) as Promise<TResult>
  }
}