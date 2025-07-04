/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DisplayMetrics } from './types';
import window from '@ohos.window';
import { RNOHLogger } from './RNOHLogger';
import display from '@ohos.display';
import { RNOHError } from "./RNOHError"
import AbilityConfiguration from '@ohos.app.ability.Configuration';

const defaultDisplayMetrics: DisplayMetrics = {
  windowPhysicalPixels: {
    width: 0,
    height: 0,
    scale: 1,
    fontScale: 1,
    densityDpi: 480,
    xDpi: 440,
    yDpi: 440
  },
  screenPhysicalPixels: {
    width: 0,
    height: 0,
    scale: 1,
    fontScale: 1,
    densityDpi: 480,
    xDpi: 440,
    yDpi: 440
  },
} as const;

/**
 * @internal
 */
export class DisplayMetricsManager {
  private displayMetrics: DisplayMetrics = defaultDisplayMetrics;
  private logger: RNOHLogger
  private displayId: number | undefined;

  constructor(logger: RNOHLogger) {
    this.logger = logger.clone("DisplayMetricsManager");
  }

  public updateWindowSize(windowSize: window.Size | window.Rect) {
    this.displayMetrics.windowPhysicalPixels.height = windowSize.height;
    this.displayMetrics.windowPhysicalPixels.width = windowSize.width;
    this.updateDisplayMetrics()
  }

  public updateConfiguration(config: AbilityConfiguration.Configuration) {
    this.displayId = config.displayId;
    if (config.fontSizeScale) {
      this.displayMetrics.screenPhysicalPixels.fontScale = config.fontSizeScale;
      this.displayMetrics.windowPhysicalPixels.fontScale = config.fontSizeScale;
    }
    this.updateDisplayMetrics()
  }

  public updateDisplayMetrics() {
    let displayInstance: display.Display | undefined = undefined;
    const errors: Object[] = []
    try {
      // displayId can be "-1" on older ROMs. In that case, fallback to getDefaultDisplaySync.
      displayInstance = display.getDisplayByIdSync(this.displayId);
    } catch (err) {
      errors.push(err)
      try {
        displayInstance = display.getDefaultDisplaySync()
      } catch (err2) {
        errors.push(err2)
      }
    }
    if (!displayInstance) {
      this.logger.error('Failed to update display size: ' + JSON.stringify(errors));
      return;
    }
    this.displayMetrics = {
      screenPhysicalPixels: {
        width: displayInstance.width,
        height: displayInstance.height,
        scale: displayInstance.densityPixels,
        fontScale: this.displayMetrics.screenPhysicalPixels.fontScale,
        densityDpi: displayInstance.densityDPI,
        xDpi: displayInstance.xDPI,
        yDpi: displayInstance.yDPI
      },
      windowPhysicalPixels: {
        width: this.displayMetrics.windowPhysicalPixels.width,
        height: this.displayMetrics.windowPhysicalPixels.height,
        scale: displayInstance.densityPixels,
        fontScale: this.displayMetrics.windowPhysicalPixels.fontScale,
        densityDpi: displayInstance.densityDPI,
        xDpi: displayInstance.xDPI,
        yDpi: displayInstance.yDPI
      }
    };
  }

  public getDisplayMetrics(): DisplayMetrics {
    if (!this.displayMetrics) {
      throw new RNOHError({ whatHappened: "DisplayMetrics are undefined", howCanItBeFixed: [] });
    }
    return this.displayMetrics;
  }
}