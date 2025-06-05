/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import vibrator from '@ohos.vibrator'
import { RNOHLogger } from "./RNOHLogger"

export class VibrationController {
  private static isVibrating: boolean = false;

  private static currentTimerId: number = 0;

  private static vibrationRequestId: number = 0; // vibrationRequestId is necessary to prevent race condition.

  private logger: RNOHLogger;

  constructor(logger: RNOHLogger) {
    this.logger = logger.clone("Vibration")
  }

  public vibrate(pattern: number) {
    vibrator.startVibration({
      type: 'time',
      duration: pattern,
    }, {
      id: 0,
      usage: 'simulateReality'
    }, (error) => {
      const logger = this.logger.clone('vibrate');
      if (error) {
        if (error.code === 201) {
          logger?.error('Permission denied. Check if \'ohos.permission.VIBRATE\' has been granted');
        }
        logger.error(error);
      }
    });
  }

  public vibrateByPattern(pattern: Array<number>, repeat: number): void{
    if (VibrationController.isVibrating) {
      return;
    }
    VibrationController.isVibrating = true;
    if (pattern.length === 0) {
      VibrationController.isVibrating = false;
      return;
    }
    this.vibrateScheduler(++VibrationController.vibrationRequestId, pattern, repeat, 0);
  }

  public vibrateScheduler(
    id: number,
    pattern: Array<number>,
    repeat: number,
    nextIndex: number,
    shouldVibrate: boolean = false, // first value in pattern is delay
  ): void{
    if (!VibrationController.isVibrating || id !== VibrationController.vibrationRequestId) {
      return;
    }
    if (shouldVibrate && nextIndex < pattern.length) {
      this.vibrate(pattern[nextIndex]);
    }
    if (nextIndex >= pattern.length) {
      if (repeat + 1) {
        nextIndex = 0;
        shouldVibrate = false;
      } else {
        VibrationController.isVibrating = false;
        return;
      }
    }
    VibrationController.currentTimerId = setTimeout(
      () => this.vibrateScheduler(id, pattern, repeat, nextIndex + 1, !shouldVibrate),
      pattern[nextIndex],
    )
  }

  public cancel() {
    VibrationController.isVibrating = false;
    vibrator.stopVibration();
  }

  public onDestroy() {
    clearTimeout(VibrationController.currentTimerId);
  }
}