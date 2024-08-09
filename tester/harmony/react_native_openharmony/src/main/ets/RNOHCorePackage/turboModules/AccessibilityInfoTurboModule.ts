import accessibility from '@ohos.accessibility';
import type { TurboModuleContext } from '../../RNOH/TurboModule';
import { TurboModule } from '../../RNOH/TurboModule';
import { BusinessError } from '@ohos.base';

const ALL_ABILITY_TYPE: accessibility.AbilityType = 'all';
const ENABLE_ABILITY_STATE: accessibility.AbilityState = 'enable';

export class AccessibilityInfoTurboModule extends TurboModule {
  public static readonly NAME = 'AccessibilityInfo';

  public ctx: TurboModuleContext;
  private cleanUpCallbacks: (() => void)[] = [];
  private onAccessibilityStateChange: ((isOn: boolean) => void) | undefined;

  constructor(ctx: TurboModuleContext) {
    super(ctx);
    this.ctx = ctx;
    this.subscribeListeners();
  }

  private subscribeListeners() {
    this.ctx.logger.info(`AccessibilityInfoTurboModule subscribeListeners`);

    this.onAccessibilityStateChange = (isOn: boolean) => {
      this.ctx.logger.info(`AccessibilityInfoTurboModule accessibilityStateChange : ` + isOn);
      this.ctx.rnInstance.emitDeviceEvent("accessibilityServiceChanged", isOn);
    };

    accessibility.on("accessibilityStateChange", this.onAccessibilityStateChange);

    this.cleanUpCallbacks.push(() => {
      if (this.onAccessibilityStateChange) {
        accessibility.off("accessibilityStateChange", this.onAccessibilityStateChange);
      }
    });
  }

  __onDestroy__() {
    super.__onDestroy__();
    this.cleanUpCallbacks.forEach(cb => cb());
    this.cleanUpCallbacks = []; 
  }

  public isTouchExplorationEnabled(
    resolveCallback: (isScreenReaderEnabled: boolean) => void,
  ) {
    const isScreenReaderEnabled = accessibility.isOpenTouchGuideSync();
    resolveCallback(isScreenReaderEnabled);
  }

  public isAccessibilityServiceEnabled(
    resolveCallback: (isAccessibilityServiceEnabled: boolean) => void,
  ) {
    accessibility.getAccessibilityExtensionList(ALL_ABILITY_TYPE, ENABLE_ABILITY_STATE)
      .then((data: accessibility.AccessibilityAbilityInfo[]) => {
        if (data.length > 0) {
          resolveCallback(true);
        } else {
          resolveCallback(false);
        }
      }).catch((err: BusinessError) => {
        this.ctx.logger.error(`Failed to get accessibility extension list, Code is ${err.code}, message is ${err.message}`);
        resolveCallback(false);
      });

  }
}
