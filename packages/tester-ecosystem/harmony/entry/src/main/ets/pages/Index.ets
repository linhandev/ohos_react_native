import {
  MetroJSBundleProvider,
  RNApp,
  RNOHErrorDialog,
  RNOHLogger,
  TraceJSBundleProviderDecorator,
  RNOHCoreContext,
  ComponentBuilderContext
} from '@rnoh/react-native-openharmony';
import { getRNOHPackages } from '../PackageProvider';
import { RNDateTimePicker, DATETIME_PICKER_VIEW_TYPE } from "@react-native-oh-tpl/datetimepicker"
import { LottieAnimationView } from '@react-native-oh-tpl/lottie-react-native';


@Builder
export function buildCustomRNComponent(ctx: ComponentBuilderContext) {
  /**
   * NOTE: This approach of registering components is no longer recommended.
   * Libraries are expected to use RNOHPackage.ets and register components there.
   * If a library doesn't use RNOHPackage, then this approach needs to be used.
   */
  if (ctx.componentName === DATETIME_PICKER_VIEW_TYPE) {
    RNDateTimePicker({
      ctx: ctx.rnComponentContext,
      tag: ctx.tag,
    })
  } else if (ctx.componentName === LottieAnimationView.NAME) {
    LottieAnimationView({
      ctx: ctx.rnComponentContext,
      tag: ctx.tag,
    })
  }
}

const wrappedCustomRNComponentBuilder = wrapBuilder(buildCustomRNComponent)

@Entry
@Component
struct Index {
  @StorageLink('RNOHCoreContext') private rnohCoreContext: RNOHCoreContext | undefined = undefined
  @State shouldShow: boolean = false
  private logger!: RNOHLogger

  aboutToAppear() {
    this.logger = this.rnohCoreContext!.logger.clone("Index")
    const stopTracing = this.logger.clone("aboutToAppear").startTracing()
    this.shouldShow = true
    stopTracing()
  }

  onBackPress(): boolean | undefined {
    this.rnohCoreContext!.dispatchBackPress()
    return true
  }

  build() {
    Column() {
      if (this.rnohCoreContext && this.shouldShow) {
        if (this.rnohCoreContext?.isDebugModeEnabled) {
          RNOHErrorDialog({ ctx: this.rnohCoreContext })
        }
        RNApp({
          rnInstanceConfig: {
            name: "app_name",
            createRNPackages: getRNOHPackages,
          },
          wrappedCustomRNComponentBuilder: wrappedCustomRNComponentBuilder,
          appKey: "app_name",
          jsBundleProvider: new TraceJSBundleProviderDecorator(
            MetroJSBundleProvider.fromServerIp("localhost", 8084),
            this.rnohCoreContext.logger),
        })
      }
    }
    .height('100%')
    .width('100%')
  }
}
