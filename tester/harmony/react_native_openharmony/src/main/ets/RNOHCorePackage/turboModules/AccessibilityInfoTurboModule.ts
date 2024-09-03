import accessibility from '@ohos.accessibility';
import type { UITurboModuleContext } from '../../RNOH/TurboModule';
import { UITurboModule } from '../../RNOH/TurboModule';

type AccessibilityFeature = "SCREEN_READER"
type AccessibilityDeviceEvent = "screenReaderChanged"

export class AccessibilityInfoTurboModule extends UITurboModule {
  public static readonly NAME = 'AccessibilityInfo';

  private cleanUpCallbacks: (() => void)[] = [];
  private enabledAccessibilityFeatures = new Set<AccessibilityFeature>()
  private deviceEventByAccessibilityFeatureName =
    new Map<AccessibilityFeature, AccessibilityDeviceEvent>().set("SCREEN_READER", "screenReaderChanged")

  constructor(ctx: UITurboModuleContext) {
    super(ctx);
    this.enabledAccessibilityFeatures = this.getEnabledAccessibilityFeatures()
    this.subscribeListeners();
  }

  private getEnabledAccessibilityFeatures(): Set<AccessibilityFeature> {
    const accessibilityExtensions = accessibility.getAccessibilityExtensionListSync("all", "enable")
    const newEnabledAccessibilityFeatures = new Set<AccessibilityFeature>()
    for (const accessibilityExtension of accessibilityExtensions) {
      if (accessibilityExtension.bundleName === "com.huawei.hmos.screenreader") {
        newEnabledAccessibilityFeatures.add("SCREEN_READER")
      }
    }
    return newEnabledAccessibilityFeatures
  }

  __onDestroy__() {
    super.__onDestroy__();
    this.cleanUpCallbacks.forEach(cb => cb());
    this.cleanUpCallbacks = [];
  }

  private subscribeListeners() {
    const onAccessibilityStateChange = (isOn: boolean) => this.onAccessibilityStateChange(isOn)
    accessibility.on("accessibilityStateChange", onAccessibilityStateChange);
    this.cleanUpCallbacks.push(() => {
      accessibility.off("accessibilityStateChange", onAccessibilityStateChange);
    });
  }

  private onAccessibilityStateChange(isOn: boolean) {
    const newEnabledAccessibilityFeatures = this.getEnabledAccessibilityFeatures()
    const oldEnabledAccessibilityFeatures = this.enabledAccessibilityFeatures;
    const { added, removed } = compareSets(oldEnabledAccessibilityFeatures, newEnabledAccessibilityFeatures)
    added.forEach(enabledFeature => {
      this.ctx.rnInstance.emitDeviceEvent(this.deviceEventByAccessibilityFeatureName.get(enabledFeature), true)
    })
    removed.forEach(disabledFeature => {
      this.ctx.rnInstance.emitDeviceEvent(this.deviceEventByAccessibilityFeatureName.get(disabledFeature), false)
    })
    this.ctx.rnInstance.emitDeviceEvent("accessibilityServiceChanged", isOn);
    this.enabledAccessibilityFeatures = newEnabledAccessibilityFeatures;
  }

  public isScreenReaderEnabled(): Promise<boolean> {
    return Promise.resolve(this.enabledAccessibilityFeatures.has("SCREEN_READER"));
  }

  public async isAccessibilityServiceEnabled(): Promise<boolean> {
    const enabledAccessibilityExtensions = await accessibility.getAccessibilityExtensionList("all", "enable")
    return enabledAccessibilityExtensions.length > 0
  }
}

function compareSets<T>(oldSet: Set<T>, newSet: Set<T>): {
  added: Set<T>;
  removed: Set<T>;
} {
  const added = new Set<T>([...newSet].filter(x =>!oldSet.has(x)));
  const removed = new Set<T>([...oldSet].filter(x =>!newSet.has(x)));

  return { added, removed };
}
