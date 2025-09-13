/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RNComponentContext, RNViewBase } from "@rnoh/react-native-openharmony"
import { RNPicker as GENERATED } from "../generated/components/RNPicker"

@Component
export struct RNPicker {
  public static NAME: string = GENERATED.NAME
  // ----------------------------------------
  public ctx!: RNComponentContext
  public tag: number = 0
  // ----------------------------------------
  @State private descriptor: GENERATED.DescriptorWrapper =
    {} as GENERATED.DescriptorWrapper
  @State private selectedIndex: number | undefined = undefined;
  private eventEmitter: GENERATED.EventEmitter | undefined = undefined
  private cleanUpCallbacks: (() => void)[] = []

  aboutToAppear() {
    this.eventEmitter = new GENERATED.EventEmitter(this.ctx.rnInstance, this.tag)
    this.onDescriptorWrapperChange(this.ctx.descriptorRegistry.findDescriptorWrapperByTag<GENERATED.DescriptorWrapper>(this.tag)!)
    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (_descriptor, newDescriptorWrapper) => {
        if (newDescriptorWrapper instanceof GENERATED.DescriptorWrapper) {
          this.onDescriptorWrapperChange(newDescriptorWrapper)
        }
      }
    ))

  }

  private onDescriptorWrapperChange(descriptor: GENERATED.DescriptorWrapper) {
    this.descriptor = descriptor
    this.selectedIndex = this.getSelectedIndex(descriptor)
  }

  aboutToDisappear() {
    this.cleanUpCallbacks.forEach(cb => cb())
  }

  private getSelectedIndex(descriptor: GENERATED.DescriptorWrapper): number | undefined {
    for (let i = 0; i < descriptor.props.items.length; i++) {
      if (descriptor.props.items[i].value === descriptor.props.selectedValue) {
        return i;
      }
    }
    if (descriptor.props.items.length > 0) {
      return 0;
    }
    return undefined;
  }

  private getSelectOptions() {
    return this.descriptor.props.items.map<SelectOption>((item) => {
      return {
        value: item.label
      }
    })
  }

  private getItemByIndex(index: number) {
    if (index < 0 || index >= this.descriptor.props.items.length) {
      this.ctx.logger.clone("RNPicker").warn("Invalid index — this should never happen")
      return undefined;
    }
    return this.descriptor.props.items[index];
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Select(this.getSelectOptions())
        .selected(this.selectedIndex)
        .value(this.getItemByIndex(this.selectedIndex ?? -1)?.label)
        .enabled(this.descriptor.props.enabled)
        .onSelect((index: number, text?: string | undefined) => {
          {
            /**
             * By default, this component updates chosen value even if onSelect does nothing resulting in a state drift
             * between the values provided to the "selected" and "value" props and the actual result.
             * This block of code, fixes this problem. It assigns a new index and immediately reverts back selected index.
             * It works, because ArkUI detects a change in the selectedIndex.
             */
            this.selectedIndex = index;
            this.selectedIndex = this.getSelectedIndex(this.descriptor)
          }
          this.eventEmitter?.emit("valueChange", { itemIndex: index, itemValue: this.getItemByIndex(index)?.value })
        })
        // BorderRadius is set here to round the highlight that appears after touching this component.
        .borderRadius(this.descriptor.borderRadius)
        // Picker is transparent by default on Android.
        .backgroundColor(Color.Transparent)
        .fontColor(this.descriptor.props.fontColor.toRGBAString())
        .optionFontColor(this.descriptor.props.itemFontColor.toRGBAString())
        .optionBgColor(this.descriptor.props.itemBackgroundColor.toRGBAString())
        .selectedOptionFontColor(this.descriptor.props.selectedItemFontColor.toRGBAString())
        .selectedOptionBgColor(this.descriptor.props.selectedItemBackgroundColor.toRGBAString())
        .menuBackgroundColor(this.descriptor.backgroundColor)
        .width('100%')
        .height('100%')
    }
  }
}
