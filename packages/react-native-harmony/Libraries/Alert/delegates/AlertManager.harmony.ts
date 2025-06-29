/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { TurboModule } from '../../TurboModule/RCTExport';
import * as TurboModuleRegistry from '../../TurboModule/TurboModuleRegistry';

/* 'buttonClicked' | 'dismissed' */
type AlertAction = string;
/*
  primaryButton = 1,
  secondaryButton = 2,
  thirdaryButton = 3,
*/
type AlertButtonKey = number;
export type AlertOptions = {
  title?: string;
  message?: string;
  primaryButton?: string;
  secondaryButton?: string;
  tertiaryButton?: string;
  items?: Array<string>;
  cancelable?: boolean;
};

export interface Spec extends TurboModule {
  getConstants: () => {
    buttonClicked: AlertAction;
    dismissed: AlertAction;
    primaryButton: AlertButtonKey;
    secondaryButton: AlertButtonKey;
    tertiaryButton: AlertButtonKey;
  };
  alert: (
    options: AlertOptions,
    onError: (error: string) => void,
    onAction: (action: AlertAction, buttonKey?: AlertButtonKey) => void
  ) => void;
}

export default TurboModuleRegistry.get<Spec>('AlertManager');
