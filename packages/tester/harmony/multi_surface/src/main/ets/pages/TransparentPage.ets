import {
  AnyJSBundleProvider,
  MetroJSBundleProvider,
  RNApp,
  RNOHErrorDialog,
  RNOHLogger,
  TraceJSBundleProviderDecorator,
  RNOHCoreContext
} from '@rnoh/react-native-openharmony';
import { createRNPackages } from '../PackageProvider';

@Component
struct PressCounter {
  @State count: number = 0

  build() {
    Button(`Pressed: ${this.count} time${this.count == 1 ? '' : 's'}`)
      .onClick(() => {
        this.count += 1;
      }).height(100)
  }
}

@Entry
@Component
struct TransparentPage {
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
    this.rnohCoreContext?.dispatchBackPress()
    return false
  }

  build() {
    Stack() {
      PressCounter().position({ y: "25%" })
      PressCounter().position({ y: "40%" })

      if (this.rnohCoreContext && this.shouldShow) {
        RNApp({
          rnInstanceConfig: {
            createRNPackages,
            enablePartialSyncOfDescriptorRegistryInCAPI: true,
          },
          initialProps: { "foo": "bar" },
          appKey: "transparent",
          jsBundleProvider: new TraceJSBundleProviderDecorator(
            new AnyJSBundleProvider([
              new MetroJSBundleProvider(),
            ]),
            this.rnohCoreContext.logger),
        })
      }
    }
    .height('100%')
    .width('100%')
  }
}
