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
// Forked from https://github.com/react-native-oh-library/datetimepicker/tree/sig


import { RNComponentContext, RNOHLogger, RNViewBase } from '@rnoh/react-native-openharmony'
import { RNDatePickerNative as GENERATED } from '../generated/components/RNDatePickerNative'

@Component
export struct RNDatePickerNative {
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
    this.logger = this.ctx.logger.clone(RNDatePickerNative.NAME);
    this.eventEmitter = new GENERATED.EventEmitter(this.ctx.rnInstance, this.tag);
    this.onDescriptorWrapperChange(this.ctx.descriptorRegistry.findDescriptorWrapperByTag<GENERATED.DescriptorWrapper>(this.tag)!);

    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (_descriptor, newDescriptorWrapper) => {
        if (newDescriptorWrapper instanceof GENERATED.DescriptorWrapper) {
          this.onDescriptorWrapperChange(newDescriptorWrapper);
        }
      }
    ));

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
    this.logger.debug(`onDateChange, dateIn: ${JSON.stringify(dateIn)}`);
    let time = dateIn.getTime();

    this.eventEmitter?.emit("change", {
      timestamp: time,
    });
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      DatePicker({
        start: this.descriptor.props.minimumDate != 0 ?
          new Date(this.descriptor.props.minimumDate) : new Date(1970, 0, 0),
        end: this.descriptor.props.maximumDate != 0 ?
          new Date(this.descriptor.props.maximumDate) : new Date(2100, 0, 0),
        selected: this.selectDate
      })
        .enabled(this.descriptor.props.enabled)
        .onDateChange((value: Date) => {
          this.selectDate = value;
          this.logger.debug(`selected date changed to: ${JSON.stringify(value)}`);
          this.onDateChange(this.selectDate);
        })
        .width("100%")
        .height("100%")
    }
  }
}