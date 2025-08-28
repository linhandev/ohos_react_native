/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import setAndForwardRef from '../../Utilities/setAndForwardRef';

export function processRef(ref) {
  return setAndForwardRef({
    getForwardedRef: () => ref,
    setLocalRef: (localRef) => {
      if (localRef != null && localRef.getNode == null) {
        localRef.getNode = () => {
          return localRef;
        };
      }
    },
  });
}
