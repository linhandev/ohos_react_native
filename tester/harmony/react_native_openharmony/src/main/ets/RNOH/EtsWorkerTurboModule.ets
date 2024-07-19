/**
 * This file location relative to the package root shouldn't change to avoid introducing breaking changes.
 */

import { lang } from '@kit.ArkTS';
import { RNOHLogger } from './RNOHLogger'
import { WorkerTurboModuleContext, WorkerTurboModule } from "./TurboModule"
import { SupportedUITaskParams, UITaskRunnable, UITaskRunner } from "./UITaskRunner"


/**
 * @api
 */
export class EtsWorkerTurboModuleContext implements WorkerTurboModuleContext {
  private workerTurboModuleContext: WorkerTurboModuleContext
  private uiTaskRunner: UITaskRunner

  /**
   * @internal
   */
  constructor(workerTurboModuleContext: WorkerTurboModuleContext,
    onRunOnUIThread: UITaskRunner) {
    this.workerTurboModuleContext = workerTurboModuleContext
    this.uiTaskRunner = onRunOnUIThread
  }

  get logger(): RNOHLogger {
    return this.workerTurboModuleContext.logger
  }

  get uiAbilityContext() {
    return this.workerTurboModuleContext.uiAbilityContext
  }

  get rnInstance() {
    return this.workerTurboModuleContext.rnInstance
  }

  async runOnUIThread<TParams extends SupportedUITaskParams, TResult extends lang.ISendable | void, TRunnable extends UITaskRunnable<TParams, TResult>>(runnable: TRunnable,
    params: TParams): Promise<TResult> {
    return this.uiTaskRunner.run(runnable, params) as Promise<TResult>
  }
}

/**
 * @api
 * @thread: WORKER
 */
export class EtsWorkerTurboModule extends WorkerTurboModule {
  protected ctx: EtsWorkerTurboModuleContext

  constructor(ctx: WorkerTurboModuleContext) {
    super(ctx)
    this.ctx = ctx as EtsWorkerTurboModuleContext;
  }
}