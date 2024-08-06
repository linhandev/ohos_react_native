import type { MainTurboModule, MainTurboModuleContext, WorkerTurboModule, WorkerTurboModuleContext, TurboModuleContext, TurboModule } from "./TurboModule";
import type { DescriptorWrapperFactory } from "./DescriptorRegistry"


export abstract class TurboModulesFactory<TTurboModule = MainTurboModule, TTurboModuleContext = MainTurboModuleContext> {
  constructor(protected ctx: TTurboModuleContext) {
  }

  abstract createTurboModule(name: string): TTurboModule | null;

  prepareEagerTurboModules(): Promise<void> {
    return Promise.resolve()
  }

  abstract hasTurboModule(name: string): boolean;
}

class FakeTurboModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string) {
    return null
  }

  hasTurboModule(name: string) {
    return false
  }
}

/**
 * This context provides a way to inject dependencies in the future without in non-breaking changes manner.
 */
export type RNPackageContext = {};
export type DescriptorWrapperFactoryByDescriptorTypeCtx = {}
export type DescriptorWrapperFactoryByDescriptorType = Record<string, DescriptorWrapperFactory>
export type MainTurboModulesFactory = TurboModulesFactory


export abstract class RNPackage {
  constructor(protected ctx: RNPackageContext) {
  };

  /**
   * TurboModules created by this factory live on MAIN (UI) thread which may impact the performance.
   */
  createTurboModulesFactory(ctx: MainTurboModuleContext): MainTurboModulesFactory {
    return new FakeTurboModulesFactory(ctx)
  };

  /**
   * @experimental
   * Turbo Models created by provided factory will be used only if workerTurboModule feature flag is enabled by the application developer.
   * RNOH tries to load Turbo Modules in the following order:
   * 1. WorkerTurboModules (ArkTS)
   * 2. MainTurboModules (ArkTS)
   * 3. CppTurboModules (JS thread)
   *
   */
  createWorkerTurboModulesFactory(ctx: WorkerTurboModuleContext): TurboModulesFactory<WorkerTurboModule, WorkerTurboModuleContext> | null {
    return null;
  }

  getDebugName(): string | undefined {
    return undefined
  }

  /**
   * @architecture: ArkTS
   */
  createDescriptorWrapperFactoryByDescriptorType(ctx: DescriptorWrapperFactoryByDescriptorTypeCtx): DescriptorWrapperFactoryByDescriptorType {
    return {}
  }
}