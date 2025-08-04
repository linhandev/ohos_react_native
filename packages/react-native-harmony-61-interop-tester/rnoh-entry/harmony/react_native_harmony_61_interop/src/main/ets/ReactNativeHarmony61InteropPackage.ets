/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { RNOHPackage, ComponentBuilderContext } from "@rnoh/react-native-openharmony"
import { RNCheckBox } from "./components/RNCheckBox"

export default class ReactHarmony61InteropPackage extends RNOHPackage {
  override createWrappedCustomRNComponentBuilderByComponentNameMap() {
    const result = new Map<string, WrappedBuilder<[ComponentBuilderContext]>>();
    result.set(RNCheckBox.NAME, wrapBuilder(buildRNCheckBox))
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

