import { RNInstance, RNComponentContext, CustomComponentBuilder } from "./RNOH"
import { RNSurface, SurfaceConfig2 } from "./RNSurface"

/**
 * @api: RN_APP_DEVELOPER
 */
@CustomDialog
export struct LogBoxDialog {
  public ctx!: RNComponentContext
  public initialProps: Record<string, string> = {}
  /**
   * @deprecated: do not use it (latestRNOHVersion: 0.72.39)
   */
  public controller: CustomDialogController
  /**
   * @deprecated: do not use it (latestRNOHVersion: 0.72.39)
   */
  public rnInstance!: RNInstance
  /**
   * @deprecated: do not use it (latestRNOHVersion 0.72.39)
   */
  @BuilderParam public buildCustomComponent!: CustomComponentBuilder

  build() {
    RNSurface({
      ctx: this.ctx!,
      surfaceConfig: {
        initialProps: this.initialProps ?? {},
        appKey: "LogBox",
      },
      buildCustomComponent: this.buildCustomComponent,
    })
  }
}
