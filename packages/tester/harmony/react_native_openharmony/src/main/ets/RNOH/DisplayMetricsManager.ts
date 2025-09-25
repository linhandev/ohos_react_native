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
    top: 0,
    left: 0,
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

  public updateWindowRect(windowRect: window.Rect) {
    this.displayMetrics.windowPhysicalPixels.top = windowRect.top;
    this.displayMetrics.windowPhysicalPixels.left = windowRect.left;
    this.updateWindowSize({
      height: windowRect.height,
      width: windowRect.width
    })
  }

  public updateWindowSize(windowSize: window.Size) {
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

  public getRNDisplay(): display.Display | undefined {
    const errors: unknown[] = [];
    let displayInstance: display.Display | undefined;

    try {
      displayInstance = display.getDisplayByIdSync(this.displayId);
    } catch (err) {
      errors.push(err);
      try {
        displayInstance = display.getDefaultDisplaySync();
      } catch (err2) {
        errors.push(err2);
      }
    }

    if (!displayInstance) {
      this.logger.error('Failed to get display instance: ' + JSON.stringify(errors));
    }

    return displayInstance;
  }

  public updateDisplayMetrics() {
    const currentDisplay = this.getRNDisplay();
    if (!currentDisplay) {
      return;
    }
    this.displayMetrics = {
      screenPhysicalPixels: {
        width: currentDisplay.width,
        height: currentDisplay.height,
        scale: currentDisplay.densityPixels,
        fontScale: this.displayMetrics.screenPhysicalPixels.fontScale,
        densityDpi: currentDisplay.densityDPI,
        xDpi: currentDisplay.xDPI,
        yDpi: currentDisplay.yDPI
      },
      windowPhysicalPixels: {
        top: this.displayMetrics.windowPhysicalPixels.top,
        left: this.displayMetrics.windowPhysicalPixels.left,
        width: this.displayMetrics.windowPhysicalPixels.width,
        height: this.displayMetrics.windowPhysicalPixels.height,
        scale: currentDisplay.densityPixels,
        fontScale: this.displayMetrics.windowPhysicalPixels.fontScale,
        densityDpi: currentDisplay.densityDPI,
        xDpi: currentDisplay.xDPI,
        yDpi: currentDisplay.yDPI
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