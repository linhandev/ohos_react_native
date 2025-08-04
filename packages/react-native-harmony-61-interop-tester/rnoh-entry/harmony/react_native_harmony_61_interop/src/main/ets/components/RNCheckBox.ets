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
  public static NAME: string = GENERATED.NAME;
  @Require public ctx!: RNComponentContext
  @Require public tag: number = 0

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Text("Not implemented")
    }
  }
}
