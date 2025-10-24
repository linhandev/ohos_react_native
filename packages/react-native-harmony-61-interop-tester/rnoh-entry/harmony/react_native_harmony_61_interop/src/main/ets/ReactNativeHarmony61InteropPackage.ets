/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
  RNOHPackage,
  ComponentBuilderContext,
  DescriptorWrapperFactoryByDescriptorTypeCtx,
  DescriptorWrapperFactoryByDescriptorType,
  UITurboModuleContext,
  UITurboModule,
} from "@rnoh/react-native-openharmony"
import { RNCheckBox } from "./components/RNCheckBox"
import { RNTimePickerNative } from "./components/RNTimePickerNative"
import { RNDatePickerNative } from "./components/RNDatePickerNative"
import { RNPicker } from "./components/RNPicker"
import { RNProgressView } from "./components/RNProgressView"
import { RNSegmentedControl } from "./components/RNSegmentedControl"
import { RNDatePickerAndroidModule } from "./turboModules/RNDatePickerAndroid";
import { RNTimePickerAndroidModule } from "./turboModules/RNTimePickerAndroid";
import { RNPushNotificationIOS } from "./turboModules/push_notification_ios/RNPushNotificationIOS"
import { RNPickerIOS } from "./components/RNPickerIOS"
import { RNC } from "./generated"

export default class ReactHarmony61InteropPackage extends RNOHPackage {
  override createWrappedCustomRNComponentBuilderByComponentNameMap() {
    const result = new Map<string, WrappedBuilder<[ComponentBuilderContext]>>();
    result.set(RNCheckBox.NAME, wrapBuilder(buildRNCheckBox))
    result.set(RNDatePickerNative.NAME, wrapBuilder(buildRNDatePicker))
    result.set(RNTimePickerNative.NAME, wrapBuilder(buildRNTestTimePicker))
    result.set(RNPicker.NAME, wrapBuilder(buildRNPicker))
    result.set(RNProgressView.NAME, wrapBuilder(buildRNProgressView))
    result.set(RNSegmentedControl.NAME, wrapBuilder(buildRNSegmentedControl))
    result.set(RNPickerIOS.NAME, wrapBuilder(buildRNPickerIOS))
    return result;
  }

  override getUITurboModuleFactoryByNameMap() {
    return new Map<string, (ctx: UITurboModuleContext) => UITurboModule | null>()
      .set(RNDatePickerAndroidModule.NAME, (ctx) => new RNDatePickerAndroidModule(ctx))
      .set(RNTimePickerAndroidModule.NAME, (ctx) => new RNTimePickerAndroidModule(ctx))
      .set(RNPushNotificationIOS.NAME, (ctx) => new RNPushNotificationIOS(ctx));
  }

  override createDescriptorWrapperFactoryByDescriptorType(_: DescriptorWrapperFactoryByDescriptorTypeCtx) {
    const result: DescriptorWrapperFactoryByDescriptorType = {}
    result[RNC.RNCheckBox.NAME] = (ctx) => new RNC.RNCheckBox.DescriptorWrapper(ctx.descriptor)
    result[RNC.RNDatePickerNative.NAME] = (ctx) => new RNC.RNDatePickerNative.DescriptorWrapper(ctx.descriptor)
    result[RNC.RNTimePickerNative.NAME] = (ctx) => new RNC.RNTimePickerNative.DescriptorWrapper(ctx.descriptor)
    result[RNC.RNPicker.NAME] = (ctx) => new RNC.RNPicker.DescriptorWrapper(ctx.descriptor)
    result[RNC.RNMaskedView.NAME] = (ctx) => new RNC.RNMaskedView.DescriptorWrapper(ctx.descriptor)
    result[RNC.RNProgressView.NAME] = (ctx) => new RNC.RNProgressView.DescriptorWrapper(ctx.descriptor)
    result[RNC.RNSegmentedControl.NAME] = (ctx) => new RNC.RNSegmentedControl.DescriptorWrapper(ctx.descriptor)
    result[RNC.RNPickerIOS.NAME] = (ctx) => new RNC.RNPickerIOS.DescriptorWrapper(ctx.descriptor)
    return result;
  }
}

@Builder
function buildRNCheckBox(ctx: ComponentBuilderContext) {
  RNCheckBox({
    ctx: ctx.rnComponentContext,
    tag: ctx.tag,
  })
}

@Builder
function buildRNDatePicker(ctx: ComponentBuilderContext) {
  RNDatePickerNative({
    ctx: ctx.rnComponentContext,
    tag: ctx.tag,
  })
}

@Builder
function buildRNTestTimePicker(ctx: ComponentBuilderContext) {
  RNTimePickerNative({
    ctx: ctx.rnComponentContext,
    tag: ctx.tag,
  })
}

@Builder
function buildRNPicker(ctx: ComponentBuilderContext) {
  RNPicker({
    ctx: ctx.rnComponentContext,
    tag: ctx.tag,
  })
}

@Builder
function buildRNProgressView(ctx: ComponentBuilderContext) {
  RNProgressView({
    ctx: ctx.rnComponentContext,
    tag: ctx.tag,
  })
}

@Builder
function buildRNSegmentedControl(ctx: ComponentBuilderContext) {
  RNSegmentedControl({
    ctx: ctx.rnComponentContext,
    tag: ctx.tag,
  })
}
@Builder
function buildRNPickerIOS(ctx: ComponentBuilderContext) {
  RNPickerIOS({
    ctx: ctx.rnComponentContext,
    tag: ctx.tag,
  })
}
