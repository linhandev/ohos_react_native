/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RNViewBase, RNComponentContext } from '@rnoh/react-native-openharmony'
import { RNProgressView as GENERATED } from "../generated/components/RNProgressView"


@Component
export struct RNProgressView {
  public static NAME: string = GENERATED.NAME
  // ----------------------------------------
  public ctx!: RNComponentContext
  public tag: number = 0
  // ----------------------------------------
  @State private descriptor: GENERATED.DescriptorWrapper =
    {} as GENERATED.DescriptorWrapper
  @State cleanUpCallbacks: (() => void)[] = []

  aboutToAppear() {
    this.onDescriptorWrapperChange(this.ctx.descriptorRegistry.findDescriptorWrapperByTag<GENERATED.DescriptorWrapper>(this.tag)!)
    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (_descriptor, newDescriptorWrapper) => {
        if (newDescriptorWrapper instanceof GENERATED.DescriptorWrapper) {
          this.onDescriptorWrapperChange(newDescriptorWrapper)
        }
      }))
  }

  aboutToDisappear() {
    this.cleanUpCallbacks.forEach(cb => cb())
  }

  private onDescriptorWrapperChange(descriptor: GENERATED.DescriptorWrapper) {
    this.descriptor = descriptor
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      if (this.descriptor.props.isIndeterminate) {
        Progress({ value: 0, type: ProgressType.Ring })
          .color(this.descriptor.props.progressTintColor.toRGBAString())
          .backgroundColor(this.descriptor.props.trackTintColor.toRGBAString())
          .style({ status: ProgressStatus.LOADING })
          .width("100%")
          .height("100%")
      } else {
        Progress({
          value: this.descriptor.props.progress ? this.descriptor.props.progress * 100 : 0,
          type: ProgressType.Linear
        })
          .color(this.descriptor.props.progressTintColor.toRGBAString())
          .backgroundColor(this.descriptor.props.trackTintColor.toRGBAString())
          .width("100%")
          .height("100%")
      }
    }
  }
}