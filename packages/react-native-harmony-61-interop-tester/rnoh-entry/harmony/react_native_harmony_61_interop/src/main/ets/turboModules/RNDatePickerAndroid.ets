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

import { RNDatePickerAndroid as GENERATED } from '../generated/turboModules/RNDatePickerAndroid';

interface DateSetAction {
  action: 'dateSetAction';
  year: number;
  month: number;
  day: number;
}

interface DismissedAction {
  action: 'dismissedAction';
}

type OpenResult = DateSetAction | DismissedAction;

interface NativePickerOptions {
  selected?: Date;
  start?: Date;
  end?: Date;
  onAccept?: (date: Date) => void;
  onCancel?: () => void;
}

export class RNDatePickerAndroidModule extends UITurboModule implements GENERATED.Spec {
  public static NAME: string = GENERATED.NAME
  private logger: RNOHLogger;

  constructor(ctx: UITurboModuleContext) {
    super(ctx);
    this.logger = ctx.logger.clone(RNDatePickerAndroidModule.NAME);
  }

  private openSpinner(opts: NativePickerOptions, reject: (reason?: string) => void) {
    const ctx = this.ctx.getUIContext();
    if (!ctx) {
      const msg = "UI Context is null, unable to showDatePickerDialog";
      this.logger.error(msg);
      reject(msg);
      return;
    }

    ctx.showDatePickerDialog({
      selected: opts.selected,
      start: opts.start,
      end: opts.end,
      onDateAccept: opts.onAccept,
      onCancel: opts.onCancel,
    });
  }

  private openCalendar(opts: NativePickerOptions) {
    CalendarPickerDialog.show({
      selected: opts.selected,
      start: opts.start,
      end: opts.end,
      onAccept: opts.onAccept,
      onCancel: opts.onCancel,
    });
  }

  open(opts: GENERATED.Options):
    Promise<OpenResult> {
    this.logger.debug("open");

    return new Promise<OpenResult>((resolve, reject) => {
      const nativeOpts: NativePickerOptions = {
        selected: opts.date ? new Date(opts.date) : undefined,
        start: opts.minDate ? new Date(opts.minDate) : undefined,
        end: opts.maxDate ? new Date(opts.maxDate) : undefined,

        onAccept: (date) => resolve({
          action: 'dateSetAction',
          year: date.getFullYear(),
          month: date.getMonth(),
          day: date.getDate(),
        }),

        onCancel: () => resolve({ action: 'dismissedAction' })
      };

      switch (opts.mode) {
        case 'spinner':
          this.openSpinner(nativeOpts, reject);
          break;
        case 'calendar':
          this.openCalendar(nativeOpts);
          break;
        default:
          this.logger.warn(`Unrecognized mode "${opts.mode}" passed to DatePickerAndroid, showing "calendar" mode picker.`);
          this.openCalendar(nativeOpts);
          break;
      }
    });
  }
}