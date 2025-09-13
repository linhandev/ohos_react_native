import type { ComponentBuilderContext, RNOHCoreContext } from 'rnoh';
import { RNApp, RNAbility, AnyJSBundleProvider, MetroJSBundleProvider, ResourceJSBundleProvider, } from 'rnoh'
import { SampleView, PropsDisplayer, GeneratedSampleView } from "rnoh-sample-package"
import { createRNPackages } from '../PackageProvider'

@Builder
export function buildCustomRNComponent(ctx: ComponentBuilderContext) {
  // There seems to be a problem with the placement of ArkTS components in mixed mode. Nested Stack temporarily avoided.
  Stack() {
    if (ctx.componentName === SampleView.NAME) {
      SampleView({
        ctx: ctx.rnComponentContext,
        tag: ctx.tag,
      })
    }
    if (ctx.componentName === GeneratedSampleView.NAME) {
      GeneratedSampleView({
        ctx: ctx.rnComponentContext,
        tag: ctx.tag,
      })
    }
    if (ctx.componentName === PropsDisplayer.NAME) {
      PropsDisplayer({
        ctx: ctx.rnComponentContext,
        tag: ctx.tag
      })
    }
  }
  .position({ x: 0, y: 0 })

}

const wrappedCustomRNComponentBuilder = wrapBuilder(buildCustomRNComponent)


@Builder
export function ReactApplicationPageBuilder() {
  ReactApplicationPage()
}

@Entry
@Component
struct ReactApplicationPage {
  @StorageLink('RNOHCoreContext') private rnohCoreContext: RNOHCoreContext | undefined = undefined

  onBackPress(): boolean {
    this.rnohCoreContext?.dispatchBackPress();
    return true;
  }

  build() {
    NavDestination() {
      Column() {
        RNApp({
          rnInstanceConfig: {
            createRNPackages,
            backPressHandler: () => {
              this.getUIContext().getRouter().back()
            },
            name: "app_name"
          },
          appKey: "app_name",
          wrappedCustomRNComponentBuilder: wrappedCustomRNComponentBuilder,
          jsBundleProvider: new AnyJSBundleProvider([new MetroJSBundleProvider(),
            new ResourceJSBundleProvider(this.rnohCoreContext!.uiAbilityContext.resourceManager)]),
        })
      }
      .height('100%')
      .width('100%')
    }.id("ReactApplicationPage")
  }
}
