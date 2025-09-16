/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * This TurboModule was created to test collisions in the generated code.
 */

import { TurboModuleRegistry } from 'react-native';
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';

export interface Spec extends TurboModule {
  voidFunc(): void;
  emitEventFromArkTS2Cpp(payload: { foo: string }): Promise<{ foo: string }>;
  setNativeResponderBlocked(
    isBlocked: boolean,
    origin: string,
    componentId: string
  ): void;
}

export default TurboModuleRegistry.get<Spec>('GeneratedSampleTurboModule2')!;
