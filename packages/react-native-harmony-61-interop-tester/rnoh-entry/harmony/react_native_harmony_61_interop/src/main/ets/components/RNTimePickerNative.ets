/**
 * MIT License
 *
 * Copyright (C) 2023 Huawei Device Co., Ltd.
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
// Forked from https://github.com/react-native-oh-library/datetimepicker/tree/sig

import { RNComponentContext, RNOHLogger, RNViewBase } from '@rnoh/react-native-openharmony'
import { RNTimePickerNative as GENERATED } from '../generated/components/RNTimePickerNative'

@Component
export struct RNTimePickerNative {
  public static NAME: string = GENERATED.NAME;
  // ----------------------------------------
  ctx!: RNComponentContext;
  tag: number = 0;
  // ----------------------------------------
  private logger!: RNOHLogger;
  @State private descriptor: GENERATED.DescriptorWrapper = {} as GENERATED.DescriptorWrapper;
  private unregisterDescriptorChangesListener?: () => void = undefined;
  @State selectDate: Date = new Date();
  private eventEmitter: GENERATED.EventEmitter | undefined = undefined;
  private cleanUpCallbacks: (() => void)[] = [];

  aboutToAppear() {
    this.logger = this.ctx.logger.clone(RNTimePickerNative.NAME);
    this.eventEmitter = new GENERATED.EventEmitter(this.ctx.rnInstance, this.tag);
    this.onDescriptorWrapperChange(this.ctx.descriptorRegistry.findDescriptorWrapperByTag<GENERATED.DescriptorWrapper>(this.tag)!);

    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (_descriptor, newDescriptorWrapper) => {
        if (newDescriptorWrapper instanceof GENERATED.DescriptorWrapper) {
          this.onDescriptorWrapperChange(newDescriptorWrapper);
        }
      }
    ))

    this.logger.debug(`props: ${JSON.stringify(this.descriptor.props)}`);
    this.selectDate = new Date(this.descriptor.props.date);
  }

  private onDescriptorWrapperChange(descriptor: GENERATED.DescriptorWrapper) {
    this.logger.debug("onDescriptorWrapperChange");
    this.descriptor = descriptor;
  }

  aboutToDisappear() {
    this.logger.debug("aboutToDisappear");
    this.unregisterDescriptorChangesListener?.();
  }

  onDateChange(dateIn: Date) {
    this.logger.debug(`onChange, dateIn: ${JSON.stringify(dateIn)}`);
    let time = dateIn.getTime();

    this.eventEmitter?.emit("change", {
      timestamp: time,
    });
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      TimePicker({
        selected: this.selectDate,
        format: TimePickerFormat.HOUR_MINUTE,
      })
        .useMilitaryTime(false)
        .enabled(this.descriptor.props.enabled)
        .onChange((value: TimePickerResult) => {
          this.selectDate.setHours(value.hour, value.minute)
          this.logger.debug(`selected date changed to: ${JSON.stringify(value)}`)
          this.onDateChange(this.selectDate)
        })
        .width("100%")
        .height("100%")
    }
  }
}