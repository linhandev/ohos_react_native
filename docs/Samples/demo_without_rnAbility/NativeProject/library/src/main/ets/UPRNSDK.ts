import type common from '@ohos.app.ability.common'
import { RNOHContext, RNInstance, RNInstanceOptions } from 'rnoh/ts'

export interface UPRNSDK {
  abilityContext: common.UIAbilityContext;

  createAndRegisterRNInstance(options: RNInstanceOptions): Promise<RNInstance>

  createRNOHContext({rnInstance}: { rnInstance: RNInstance }): RNOHContext;

  onBackPress(): boolean;
}