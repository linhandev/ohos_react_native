/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  BaseRefreshControlDelegate,
  RefreshControlDelegateRenderInternalProps,
} from '@react-native-oh/react-native-core/Libraries/Components/RefreshControl/delegates/BaseRefreshControlDelegate';
import PullToRefreshViewNativeComponent, {
  Commands,
  // @ts-ignore
} from 'react-native/Libraries/Components/RefreshControl/PullToRefreshViewNativeComponent';

export default class RefreshControlDelegate extends BaseRefreshControlDelegate<any> {
  override onSetNativeRefreshing(ref: unknown, refreshing: boolean): void {
    Commands.setNativeRefreshing(ref, refreshing);
  }

  override renderNativeComponent(
    internalProps: RefreshControlDelegateRenderInternalProps<any>
  ): React.ReactNode {
    const { colors, ...props } = this.ctx.getProps();
    return <PullToRefreshViewNativeComponent {...internalProps} {...props} />;
  }
}
