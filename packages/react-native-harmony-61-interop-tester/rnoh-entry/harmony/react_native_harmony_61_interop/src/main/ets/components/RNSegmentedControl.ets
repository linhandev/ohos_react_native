/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RNComponentContext, RNViewBase, Color, ColorValue } from "@rnoh/react-native-openharmony"
import { RNSegmentedControl as GENERATED } from "../generated/components/RNSegmentedControl"
import {
  SegmentButton, SegmentButtonOptions
} from "@ohos.arkui.advanced.SegmentButton"


@Component
export struct RNSegmentedControl {
  public static NAME: string = GENERATED.NAME
  // ----------------------------------------
  // RN Component Interface
  public ctx!: RNComponentContext
  public tag: number = 0
  // ----------------------------------------
  // RN Component Common Private Properties
  @State private descriptor: GENERATED.DescriptorWrapper =
    {} as GENERATED.DescriptorWrapper
  private eventEmitter: GENERATED.EventEmitter | undefined = undefined
  private cleanUpCallbacks: (() => void)[] = []
  // ----------------------------------------
  // RN Component Specific Private Properties
  @State options: SegmentButtonOptions = SegmentButtonOptions.tab({
    buttons: [{ text: "one" }, { text: "two" }],
  })
  @State selectedOptionIndexes: number[] | undefined = undefined;

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

  aboutToDisappear() {
    this.cleanUpCallbacks.forEach(cb => cb())
  }

  private onDescriptorWrapperChange(descriptor: GENERATED.DescriptorWrapper) {
    this.options.buttons = descriptor.props.options.buttons;
    if (descriptor.props.options.backgroundColor) {
      this.options.backgroundColor = Color.fromColorValue(descriptor.props.options.backgroundColor).toRGBAString()
    }
    if (descriptor.props.options.fontColor) {
      this.options.fontColor = Color.fromColorValue(descriptor.props.options.fontColor).toRGBAString()
    } else if (descriptor.props.options.backgroundColor) {
      this.options.fontColor =
        fontColorFromBackgroundColorValue(descriptor.props.options.backgroundColor)!.toRGBAString()
    }
    if (descriptor.props.options.selectedBackgroundColor) {
      this.options.selectedBackgroundColor =
        Color.fromColorValue(descriptor.props.options.selectedBackgroundColor).toRGBAString()
    }
    if (descriptor.props.options.selectedFontColor) {
      this.options.selectedFontColor = Color.fromColorValue(descriptor.props.options.selectedFontColor).toRGBAString()
    } else if (descriptor.props.options.selectedBackgroundColor) {
      this.options.selectedFontColor =
        fontColorFromBackgroundColorValue(descriptor.props.options.selectedBackgroundColor)!.toRGBAString()
    }
    this.selectedOptionIndexes = descriptor.props.selectedIndexes;
    this.descriptor = descriptor
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      SegmentButton({
        options: this.options,
        selectedIndexes: $selectedOptionIndexes,
        onItemClicked: (index) => {
          if (!this.selectedOptionIndexes) {
            return;
          }
          if (index !== this.selectedOptionIndexes[0]) {
            this.eventEmitter?.emit("change", { selectedSegmentIndex: index })
          }
        }
      })
        .enabled(this.descriptor.props.enabled)
        .opacity(this.descriptor.props.enabled ? 1 : 0.5)
        .width("100%")
        .height("100%")
    }
  }
}

function fontColorFromBackgroundColorValue(backgroundColorValue: ColorValue | undefined): Color | undefined {
  if (backgroundColorValue === undefined) {
    return undefined;
  }
  return colorToLuminance(Color.fromColorValue(backgroundColorValue)) < 0.5 ? Color.fromColorSegments([1, 1, 1, 1]) :
  Color.fromColorSegments([0, 0, 0, 1]);
}

function colorToLuminance(color: Color): number {
  const rgba = color.toSegments()
  return 0.299 * rgba[0] + 0.587 * rgba[1] + 0.114 * rgba[2];
}