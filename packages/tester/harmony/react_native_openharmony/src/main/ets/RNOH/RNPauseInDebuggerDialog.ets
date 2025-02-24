/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RNOHContext } from './RNOHContext'

interface PauseInDebuggerDialogPayload {
  message: string
}

/**
 * @api: RN_APP_DEVELOPER
 */

@Component
export struct RNPauseInDebuggerDialog {
  @Require public ctx!:  RNOHContext
  @State private message: string = '';
  private controller!: CustomDialogController
  private openCallback!: (() => void);
  private closeCallback!: (() => void);

  aboutToAppear(): void {
    const insets = this.ctx.safeAreaInsetsProvider.safeAreaInsets;
    this.controller = new CustomDialogController({
      builder: PauseInDebuggerCustomDialog({
        message: this.message,
        onResume: () => {
          this.ctx.rnInstance.postMessageToCpp("RNOH::RESUME_DEBUGGER", {})
        }
      }),
      autoCancel: false,
      alignment: DialogAlignment.Top,
      customStyle: true,
      width: '100%',
      height: '100%',
      offset: {dx: 0, dy: insets ? insets.top : 0}
    })

    this.openCallback = this.ctx.rnInstance.cppEventEmitter.subscribe("RNOH::OPEN_DEBUGGER_PAUSED_DIALOG",
      (payload: PauseInDebuggerDialogPayload): void => {
        this.controller.open()
        this.message = payload.message;
    })

    this.closeCallback = this.ctx.rnInstance.cppEventEmitter.subscribe("RNOH::CLOSE_DEBUGGER_PAUSED_DIALOG",
      (payload : object): void => {
        this.controller.close()
      })
  }

  aboutToDisappear() {
    this.openCallback();
    this.closeCallback();
  }

  build() {}
}

@CustomDialog
struct PauseInDebuggerCustomDialog {
  @Require public message!: string
  @Require public onResume!: () => void
  public controller: CustomDialogController

  build() {
      Stack() {
        Button({type: ButtonType.Normal}) {
          Row() {
            Text(this.message + " ▶️")
              .fontColor('rgb(94, 94, 94)')
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
              .textAlign(TextAlign.Center)
              .margin(8)
          }
        }
        .padding({ left: 17, right: 11 })
        .backgroundColor(Color.Transparent)
        .borderRadius(12)
        .onClick(() => this.onResume())
      }
      .alignContent(Alignment.Center)
      .borderRadius(12)
      .backgroundColor('rgb(255,255,193)')
      .borderWidth(2)
      .borderColor('rgb(181, 181, 158)')
  }
}







