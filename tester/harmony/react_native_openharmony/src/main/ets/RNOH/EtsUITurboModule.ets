/**
 * This file location relative to the package root shouldn't change to avoid introducing breaking changes.
 */
import { FatalRNOHError } from "./RNOHError"
import { UITurboModuleContext } from "./RNOHContext"
import { EtsUITurboModuleContext } from "./EtsRNOHContext"
import { UITurboModule } from '.'


/**
 * @thread: MAIN
 */
export class EtsUITurboModule extends UITurboModule {
  protected ctx: EtsUITurboModuleContext

  constructor(ctx: UITurboModuleContext) {
    super(ctx)
    if (!(ctx instanceof EtsUITurboModuleContext)) {
      throw new FatalRNOHError({
        whatHappened: "Received context not compatible with EtsUITurboModule",
        howCanItBeFixed: []
      });
    }
    this.ctx = ctx as EtsUITurboModuleContext;
  }
}