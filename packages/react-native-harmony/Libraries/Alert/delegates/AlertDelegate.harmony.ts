/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { AlertOptions } from './AlertManager';
import {
  BaseAlertDelegate,
  AlertDelegateButton,
  AlertDelegateOptions,
  AlertDelegateType,
} from '@react-native-oh/react-native-core/Libraries/Alert/delegates/BaseAlertDelegate';
import { UnsupportedByPlatformError } from '@react-native-oh/react-native-core/delegates/DelegateError';

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
    // At most two buttons. Ignore rest.
    const validButtons: AlertDelegateButton[] = (
      buttons ?? [{ text: 'OK' }]
    ).slice(0, 2);
    const secondaryButton = validButtons.pop();
    const primaryButton = validButtons.pop();
    if (primaryButton) {
      alertOptions.primaryButton = primaryButton.text || '';
    }
    if (secondaryButton) {
      alertOptions.secondaryButton = secondaryButton.text || '';
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
