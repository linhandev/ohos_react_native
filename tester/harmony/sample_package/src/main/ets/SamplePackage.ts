import {
  RNPackage,
  TurboModulesFactory,
  DescriptorWrapperFactoryByDescriptorType,
  DescriptorWrapperFactoryByDescriptorTypeCtx,
  MainTurboModuleContext,
  WorkerTurboModuleContext,
  WorkerTurboModule
} from '@rnoh/react-native-openharmony/ts';
import type { TurboModule, TurboModuleContext, } from '@rnoh/react-native-openharmony/ts';
import { RNC, TM } from "@rnoh/react-native-openharmony/generated/ts"
import { SampleTurboModule } from './SampleTurboModule';
import { SampleWorkerTurboModule } from './SampleWorkerTurboModule';

class SampleTurboModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === 'SampleTurboModule' || name === TM.GeneratedSampleTurboModule.NAME || name === TM.GeneratedSampleTurboModule2.NAME) {
      return new SampleTurboModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === 'SampleTurboModule' || name === TM.GeneratedSampleTurboModule.NAME || name === TM.GeneratedSampleTurboModule2.NAME;
  }
}

class SampleWorkerTurboModulesFactory extends TurboModulesFactory<WorkerTurboModule, WorkerTurboModuleContext> {
  createTurboModule(name: string) {
    if (name === TM.SampleWorkerTurboModule.NAME) {
      return new SampleWorkerTurboModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === TM.SampleWorkerTurboModule.NAME
  }
}

export class SamplePackage extends RNPackage {
  createTurboModulesFactory(ctx: MainTurboModuleContext): TurboModulesFactory {
    return new SampleTurboModulesFactory(ctx);
  }

  createWorkerTurboModulesFactory(ctx: WorkerTurboModuleContext) {
    return new SampleWorkerTurboModulesFactory(ctx);
  }

  createDescriptorWrapperFactoryByDescriptorType(ctx: DescriptorWrapperFactoryByDescriptorTypeCtx): DescriptorWrapperFactoryByDescriptorType {
    return { [RNC.GeneratedSampleViewArkTS.NAME]: (ctx2) => new RNC.GeneratedSampleViewArkTS.DescriptorWrapper(ctx2.descriptor) }
  }
}
