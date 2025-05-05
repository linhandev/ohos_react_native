/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  BaseStatusBarDelegate,
  StatusBarAnimation,
  StatusBarStyle,
} from './BaseStatusBarDelegate';
import NativeStatusBarManagerHarmony from './NativeStatusBarManagerHarmony.harmony';
import invariant from 'invariant';
import processColor from '../../../StyleSheet/processColor';

export default class StatusBarDelegate extends BaseStatusBarDelegate {
  override getCurrentHeight(): number {
    return NativeStatusBarManagerHarmony.getConstants().HEIGHT;
  }

  override getDefaultBackgroundColor(): string {
    return (
      NativeStatusBarManagerHarmony.getConstants().DEFAULT_BACKGROUND_COLOR ??
      'black'
    );
  }

  override setBarStyle(style: StatusBarStyle, animated?: boolean): void {
    NativeStatusBarManagerHarmony.setStyle(style);
  }

  override setColor(processedColor: number, animated?: boolean): void {
    NativeStatusBarManagerHarmony.setColor(processedColor, animated ?? false);
  }

  override setHidden(hidden: boolean, animation?: StatusBarAnimation): void {
    NativeStatusBarManagerHarmony.setHidden(hidden);
  }

  override setNetworkActivityIndicatorVisible(visible: boolean): void {
    // NOOP
    return;
  }

  override setTranslucent(translucent: boolean): void {
    NativeStatusBarManagerHarmony.setTranslucent(translucent);
  }

  override updatePropsStack(oldProps: any, newProps: any): void {
    if (!oldProps || oldProps.hidden.value !== newProps.hidden.value) {
      NativeStatusBarManagerHarmony.setHidden(newProps.hidden.value);
    }
    if (!oldProps || oldProps.barStyle.value !== newProps.barStyle.value) {
      NativeStatusBarManagerHarmony.setStyle(newProps.barStyle.value);
    }
    if (!oldProps || oldProps.translucent !== newProps.translucent) {
      NativeStatusBarManagerHarmony.setTranslucent(newProps.translucent);
    }
    if (
      !oldProps ||
      oldProps.backgroundColor.value !== newProps.backgroundColor.value
    ) {
      const processedColor = (processColor as any)(
        newProps.backgroundColor.value
      );
      if (processedColor == null) {
        console.warn(
          `\`StatusBarDelegate::updatePropsStack\`: Color ${newProps.backgroundColor.value} parsed to null or undefined`
        );
      } else {
        invariant(
          typeof processedColor === 'number',
          'Unexpected color given in StatusBarDelegate::updatePropsStack'
        );
        NativeStatusBarManagerHarmony.setColor(
          processedColor,
          newProps.backgroundColor.animated
        );
      }
    }
  }
}
