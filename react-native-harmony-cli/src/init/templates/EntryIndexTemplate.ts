import mustache from 'mustache';

const TEMPLATE = `
import {
  AnyJSBundleProvider,
  MetroJSBundleProvider,
  RNApp,
  RNOHErrorDialog,
  TraceJSBundleProviderDecorator,
  RNOHCoreContext
} from '@rnoh/react-native-openharmony';
import { getRNOHPackages } from '../PackageProvider';

@Entry
@Component
struct Index {
  @StorageLink('RNOHCoreContext') private rnohCoreContext: RNOHCoreContext | undefined = undefined

  build() {
    Column() {
      if (this.rnohCoreContext) {
        if (this.rnohCoreContext?.isDebugModeEnabled) {
          RNOHErrorDialog({ ctx: this.rnohCoreContext })
        }
        RNApp({
          rnInstanceConfig: {
            name: "{{name}}",
            createRNPackages: getRNOHPackages,
            enablePartialSyncOfDescriptorRegistryInCAPI: true,
            fontResourceByFontFamily: {},
          },
          appKey: "{{name}}",
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
`;

export class EntryIndexTemplate {
  constructor(private name: string) {}

  build(): string {
    return mustache.render(TEMPLATE.trimStart(), {
      name: this.name,
    });
  }
}
