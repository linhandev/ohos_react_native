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

import {
  RNComponentContext,
  RNViewBase,
} from '@rnoh/react-native-openharmony'
import { RNSlider as GENERATED } from "../patched/RNSLider"

@Component
export struct RNSlider {
  public static NAME: string = GENERATED.NAME
  // ----------------------------------------
  public ctx!: RNComponentContext
  public tag: number = 0
  // ----------------------------------------
  @State private descriptor: GENERATED.DescriptorWrapper =
    {} as GENERATED.DescriptorWrapper
  @State sliderValue: number = 0
  private eventEmitter: GENERATED.EventEmitter | undefined = undefined
  private cleanUpCallbacks: (() => void)[] = []

  aboutToAppear() {
    this.eventEmitter = new GENERATED.EventEmitter(this.ctx.rnInstance, this.tag)
    this.onDescriptorWrapperChange(this.ctx.descriptorRegistry.findDescriptorWrapperByTag<GENERATED.DescriptorWrapper>(this.tag)!)
    this.sliderValue = this.descriptor.props.value
    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (_descriptor, newDescriptorWrapper) => {
        if (newDescriptorWrapper instanceof GENERATED.DescriptorWrapper) {
          this.onDescriptorWrapperChange(newDescriptorWrapper)
        }
      }
    ))
  }

  aboutToDisappear() {
    this.cleanUpCallbacks.forEach(cb => cb())
  }

  private onDescriptorWrapperChange(descriptor: GENERATED.DescriptorWrapper) {
    this.descriptor = descriptor
    if (this.sliderValue !== descriptor.props.value) {
      this.sliderValue = descriptor.props.value
    }
  }

  onSliderChange(value: number, mode: SliderChangeMode) {
    if (value < this.descriptor.props.minimumValue) {
      value = this.descriptor.props.minimumValue;
    } else if (value > this.descriptor.props.maximumValue) {
      value = this.descriptor.props.maximumValue;
    }
    this.sliderValue = value
    if (mode === 0) {
      // onSliderSlidingStart is not supported in react native 61
    } else if (mode === 1) {
      this.eventEmitter!.emit("rNSliderValueChange", { value });
    } else if (mode === 2) {
      this.eventEmitter!.emit("rNSliderSlidingComplete", { value });
    } else if (mode === 3) {
      this.eventEmitter!.emit("rNSliderValueChange", { value });
    }
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Slider({
        value: this.sliderValue,
        step: this.descriptor.props.step,
        min: this.descriptor.props.minimumValue,
        max: this.descriptor.props.maximumValue,
        direction: (this.descriptor.props.vertical ? Axis.Vertical : Axis.Horizontal),
        reverse: (this.descriptor.props.inverted),
        style: SliderStyle.OutSet
      })
        .width("100%")
        .height("100%")
        .enabled(!this.descriptor.props.disabled)
        .blockColor(this.descriptor.props.thumbTintColor?.toRGBAString())
        .trackColor(this.descriptor.props.maximumTrackTintColor?.toRGBAString())
        .selectedColor(this.descriptor.props.minimumTrackTintColor?.toRGBAString())
        .showSteps(false)
        .onChange((value: number, mode: SliderChangeMode) => this.onSliderChange(value, mode))
        .slideRange({
          from: this.descriptor.props.minimumValue,
          to: this.descriptor.props.maximumValue
        })
    }
  }
}