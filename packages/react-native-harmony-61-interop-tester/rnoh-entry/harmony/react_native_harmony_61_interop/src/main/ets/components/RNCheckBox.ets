/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RNComponentContext, RNViewBase } from "@rnoh/react-native-openharmony"
import { RNCheckBox as GENERATED } from "../generated/components/RNCheckBox"

@Component
export struct RNCheckBox {
  public static NAME: string = GENERATED.NAME
  // ----------------------------------------
  public ctx!: RNComponentContext
  public tag: number = 0
  // ----------------------------------------
  @State private descriptor: GENERATED.DescriptorWrapper =
    {} as GENERATED.DescriptorWrapper
  @State isSelected: boolean = false;
  private eventEmitter: GENERATED.EventEmitter | undefined = undefined
  private cleanUpCallbacks: (() => void)[] = []

  aboutToAppear() {
    this.eventEmitter = new GENERATED.EventEmitter(this.ctx.rnInstance, this.tag)
    this.onDescriptorWrapperChange(this.ctx.descriptorRegistry.findDescriptorWrapperByTag<GENERATED.DescriptorWrapper>(this.tag)!)
    this.isSelected = this.descriptor.props.value
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
    if (this.isSelected !== descriptor.props.value) {
      this.isSelected = descriptor.props.value
    }
  }

  handleCheckBoxChange(value: boolean) {
    if (this.isSelected !== value) {
      this.eventEmitter!.emit("valueChange", { target: this.tag, value: value });
      this.isSelected = value
    }
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Checkbox()
        .enabled(!this.descriptor.props.disabled)
        .select(this.isSelected)
        .width('100%')
        .height('100%')
        .margin(0)
        .selectedColor(this.descriptor.props.checkedColor.toRGBAString())
        .unselectedColor(this.descriptor.props.uncheckedColor.toRGBAString())
        .shape(this.descriptor.props.boxType === "circle" ? CheckBoxShape.CIRCLE : CheckBoxShape.ROUNDED_SQUARE)
        .onChange((e) => {
          this.handleCheckBoxChange(e)
        })
        .mark({
          strokeColor: this.descriptor.props.strokeColor.toRGBAString(),
          size: this.descriptor.props.markSize,
          strokeWidth: this.descriptor.props.lineWidth
        })
    }
  }
}
