/**
 * MIT License
 *
 * Copyright (C) 2025 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { RNOHLogger } from '@rnoh/react-native-openharmony';
import { UITurboModule, UITurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { RNTimePickerAndroid as GENERATED } from '../generated/turboModules/RNTimePickerAndroid';
import { util } from '@kit.ArkTS';

interface TimeSetAction {
  action: 'timeSetAction';
  hour: number;
  minute: number;
}

interface DismissedAction {
  action: 'dismissedAction';
}

type OpenResult = TimeSetAction | DismissedAction;

interface NativePickerOptions {
  selected?: Date;
  useMilitaryTime: boolean;
  onAccept?: (value: TimePickerResult) => void;
  onCancel?: () => void;
}

export class RNTimePickerAndroidModule extends UITurboModule implements GENERATED.Spec {
  public static NAME: string = GENERATED.NAME
  private logger: RNOHLogger;

  constructor(ctx: UITurboModuleContext) {
    super(ctx);
    this.logger = this.ctx.logger.clone(RNTimePickerAndroidModule.NAME);
  }

  private openSpinner(opts: NativePickerOptions, reject: (reason?: string) => void) {
    const ctx = this.ctx.getUIContext();

    if (!ctx) {
      const msg = "UI Context is null, unable to showTimePickerDialog";
      this.logger.error(msg);
      reject(msg);
      return;
    }

    ctx.showTimePickerDialog({
      selected: opts.selected,
      useMilitaryTime: opts.useMilitaryTime,
      onAccept: opts.onAccept,
      onCancel: opts.onCancel,
      format: TimePickerFormat.HOUR_MINUTE,
    });
  }

  open(opts: GENERATED.Options):
    Promise<OpenResult> {
    this.logger.debug("open");

    return new Promise<OpenResult>((resolve, reject) => {
      const selected = (() => {
        const now = new Date();
        const hour = opts.hour ?? now.getHours();
        const minute = opts.minute ?? now.getMinutes();

        const clamp = (min: number, max: number, value: number) => Math.max(min, Math.min(max, value));
        // the legacy Date API wraps around out-of-range values,
        // but TimePickerAndroid clamps them.
        // Date performs conversion from non-integer values internally.
        const hourClamped = clamp(0, 23, hour);
        const minuteClamped = clamp(0, 59, minute);

        // For some reason the Harmony time picker also displays the date passed
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hourClamped, minuteClamped);
      })();

      const nativeOpts: NativePickerOptions = {
        selected: selected,
        useMilitaryTime: opts.is24Hour,

        onAccept: (time) => resolve({
          action: 'timeSetAction',
          hour: time.hour,
          minute: time.minute,
        }),

        onCancel: () => resolve({ action: 'dismissedAction' })
      };

      const mode: string = opts.mode ?? 'default';
      switch (mode) {
        case 'spinner':
        case 'default':
          this.openSpinner(nativeOpts, reject);
          break;
        case 'clock':
          this.logger.warn('mode="clock" is not supported, showing "spinner" mode picker');
          this.openSpinner(nativeOpts, reject);
          break;
        default:
          this.logger.warn(`Unrecognized mode "${opts.mode}" passed to TimePickerAndroid, showing "spinner" mode picker.`);
          this.openSpinner(nativeOpts, reject);
          break;
      }
    });
  }
}