import {
  AnyJSBundleProvider,
  MetroJSBundleProvider,
  ResourceJSBundleProvider,
  RNInstance,
  RNOHCoreContext,
  SurfaceHandle,
} from 'rnoh/ts';
import { RNAbility } from 'rnoh';
import { createRNPackages } from '../PackageProvider';


export default class EntryAbility extends RNAbility {
  protected async onPrepareRNInstance(rnohCoreContext: RNOHCoreContext): Promise<void> {
    super.onPrepareRNInstance(rnohCoreContext)
    const rnInstance: RNInstance = await rnohCoreContext.createAndRegisterRNInstance({
      createRNPackages,
      enableCAPIArchitecture: true,
      backPressHandler: () => {
      },
      name: "app_name"
    })
    rnInstance.runJSBundle(new AnyJSBundleProvider([new MetroJSBundleProvider(),
      new ResourceJSBundleProvider(this.context.resourceManager, 'bundle.harmony.js')]))
    AppStorage.setOrCreate("AppRNInstance", rnInstance);

    const surfaceByAppKey: Record<string, SurfaceHandle> = {};
    AppStorage.setOrCreate("ReactSurfaceByAppKey", surfaceByAppKey);
  }

  protected getPagePath() {
    return 'pages/Index';
  }

  getRNOHWorkerScriptUrl() {
    return "multi_surface/ets/workers/RNOHWorker.ets"
  }
}
