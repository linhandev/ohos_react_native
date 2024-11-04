import window from '@ohos.window';
import { DevToolsController } from './DevToolsController';
import { RNOHLogger } from './RNOHLogger';
import { ShakeDetector } from './ShakeDetector';
import { RNOHError } from "./RNOHError"
import type common from '@ohos.app.ability.common';


interface AlertDialogButtonOptions {
  value: string,
  action: () => void,
}

enum DialogButtonDirection {
  AUTO, HORIZONTAL, VERTICAL,
}

/**
 * @api
 */
export class DevMenu {
  private devMenuDialogVisible: boolean = false;
  private devMenuButtons: AlertDialogButtonOptions[] = []
  private logger: RNOHLogger
  protected shakeDetector: ShakeDetector | null = null

  /**
   * @internal
   */
  constructor(private devToolsController: DevToolsController,
    private uiAbilityContext: common.UIAbilityContext, logger: RNOHLogger) {
    this.logger = logger.clone("DevMenu")
    const localLogger = this.logger.clone("constructor")
    this.createDevMenuDefaultButtons()
    try {
      this.shakeDetector = ShakeDetector.from(this.show.bind(this))
    } catch (err) {
      if (err instanceof RNOHError) {
        localLogger.error(new RNOHError({
          whatHappened: "Shake to open Dev Menu is disabled. " + err.getMessage(),
          howCanItBeFixed: err.getSuggestions()
        }))
      } else {
        throw err;
      }
    }
  }

  addMenuItem(title: string): void {
    this.devMenuButtons.push({
      value: title,
      action: () => {
        this.devToolsController.emitDidPressMenuItem(title);
        this.hideDevMenuDialog();
      }
    })
  }

  private createDevMenuDefaultButtons() {
    this.devMenuButtons.push({
      value: "Reload",
      action: () => {
        this.devToolsController.reload(undefined)
        this.hideDevMenuDialog();
      },
    });
    this.devMenuButtons.push({
      value: "Toggle Element Inspector",
      action: () => {
        this.devToolsController.toggleElementInspector()
        this.hideDevMenuDialog();
      },
    });
    this.devMenuButtons.push({
      value: "Open Debugger",
      action: () => {
        this.devToolsController.openDebugger();
        this.hideDevMenuDialog();
      }
    });
    this.devMenuButtons.push({
      value: "Open React DevTools",
      action: () => {
        this.devToolsController.openDevTools();
        this.hideDevMenuDialog();
      }
    });
  }

  public show() {
    if (!this.devMenuDialogVisible) {
      this.showDevMenuDialog();
    }
  }

  private showDevMenuDialog() {
    window.getLastWindow(this.uiAbilityContext).then((value) => {
      {
        const uiContext = value.getUIContext()
        const dialogParams = {
          title: "React Native Dev Menu",
          message: "",
          buttons: this.devMenuButtons,
          buttonDirection: DialogButtonDirection.VERTICAL,
          cancel: this.hideDevMenuDialog.bind(this),
        }
        uiContext.showAlertDialog(dialogParams)
        this.devMenuDialogVisible = true;
        this.devToolsController.emitDevMenuShown();
      }
    }).catch(() => {
      this.logger.error("DevMenu dialog couldn't be displayed.");
      this.hideDevMenuDialog();
    })
  }

  private hideDevMenuDialog() {
    this.devMenuDialogVisible = false;
    this.shakeDetector?.resetDetector();
  }
}

/**
 * @internal
 */
export class InternalDevMenu extends DevMenu {
  onDestroy() {
    this.shakeDetector?.onDestroy()
  }
}