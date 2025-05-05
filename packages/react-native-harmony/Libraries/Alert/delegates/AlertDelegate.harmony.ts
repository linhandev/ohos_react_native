/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { AlertOptions } from './AlertManager.harmony';
import {
  BaseAlertDelegate,
  AlertDelegateButton,
  AlertDelegateOptions,
  AlertDelegateType,
} from './BaseAlertDelegate';
import { UnsupportedByPlatformError } from '../../../delegates/DelegateError';

export default class AlertDelegate extends BaseAlertDelegate {
  override alert(
    title: string,
    message?: string,
    buttons?: AlertDelegateButton[],
    options?: AlertDelegateOptions
  ): void {
    const AlertManager = require('./AlertManager').default;
    if (!AlertManager) {
      return;
    }
    const alertOptions: AlertOptions = {
      title: title || '',
      message: message || '',
      cancelable: false,
    };
    const constants = AlertManager.getConstants();
    if (options && options.cancelable) {
      alertOptions.cancelable = options.cancelable;
    }
    // At most three buttons. Ignore rest.
    const validButtons: AlertDelegateButton[] = (
      buttons ?? [{ text: 'OK' }]
    ).slice(0, 3);
    const secondaryButton = validButtons.pop();
    const primaryButton = validButtons.pop();
    const tertiaryButton = validButtons.pop();
    if (primaryButton) {
      alertOptions.primaryButton = primaryButton.text || '';
    }
    if (secondaryButton) {
      alertOptions.secondaryButton = secondaryButton.text || '';
    }
    if (tertiaryButton) {
      console.log('zicion: thirdary button!');
      alertOptions.tertiaryButton = tertiaryButton.text || '';
    }
    const onAction = (
      action: 'buttonClicked' | 'dismissed',
      buttonKey: number
    ) => {
      if (action === constants.buttonClicked) {
        if (buttonKey === constants.primaryButton) {
          primaryButton?.onPress && primaryButton.onPress();
        } else if (buttonKey === constants.secondaryButton) {
          secondaryButton?.onPress && secondaryButton.onPress();
        }
      } else if (action === constants.dismissed) {
        options && options.onDismiss && options.onDismiss();
      } else if (buttonKey === constants.thirdaryButton) {
        tertiaryButton?.onPress && tertiaryButton.onPress();
      }
    };
    const onError = (errorMessage: string) => console.warn(errorMessage);
    AlertManager.alert(alertOptions, onError, onAction);
  }

  override prompt(
    title: string,
    message?: string,
    callbackOrButtons?: ((text: string) => void) | AlertDelegateButton[],
    type?: AlertDelegateType,
    defaultValue?: string,
    keyboardType?: string,
    options?: AlertDelegateOptions
  ): void {
    throw new UnsupportedByPlatformError();
  }
}
