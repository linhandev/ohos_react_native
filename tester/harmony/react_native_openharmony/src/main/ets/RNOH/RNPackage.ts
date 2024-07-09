import type { UITurboModule, UITurboModuleContext, WorkerTurboModule, WorkerTurboModuleContext } from "./TurboModule";
import type { DescriptorWrapperFactory } from "./DescriptorRegistry"

/**
 * @internal
 * @deprecated This class no longer belongs to the native api. Use UITurboModuleFactory or WorkerTurboModuleFactory instead. (latestRNOHVersion: 0.72.31)
 * By default, the TTurboModule and TTurboModuleContext types are UITurboModule and UITurboModuleContext, respectively, for backward compatibility reasons.
 */
export abstract class TurboModulesFactory<TTurboModule = UITurboModule, TTurboModuleContext = UITurboModuleContext> {
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
 * @api
 * This context provides a way to inject dependencies in the future without in non-breaking changes manner.
 */
export type RNPackageContext = {};

export type DescriptorWrapperFactoryByDescriptorTypeCtx = {}

export type DescriptorWrapperFactoryByDescriptorType = Record<string, DescriptorWrapperFactory>

/**
 * @api
 */
export abstract class UITurboModuleFactory extends TurboModulesFactory<UITurboModule, UITurboModuleContext> {}

/**
 * @api
 */
export abstract class WorkerTurboModuleFactory extends TurboModulesFactory<WorkerTurboModule, WorkerTurboModuleContext> {}


export abstract class RNPackage {
  constructor(protected ctx: RNPackageContext) {
  };

  /**
   * @deprecated
   * Use createUITurboModuleFactory instead.
   */
  createTurboModulesFactory(ctx: UITurboModuleContext): TurboModulesFactory {
    return new FakeTurboModulesFactory(ctx)
  };

  createUITurboModuleFactory(ctx: UITurboModuleContext): UITurboModuleFactory {
    return new FakeTurboModulesFactory(ctx)
  };

  /**
   * @experimental
   * Turbo Models created by provided factory will be used only if workerTurboModule feature flag is enabled by the application developer.
   * RNOH tries to load Turbo Modules in the following order:
   * 1. WorkerTurboModules (ArkTS)
   * 2. UITurboModules (ArkTS)
   * 3. CppTurboModules (JS thread)
   *
   */
  createWorkerTurboModuleFactory(ctx: WorkerTurboModuleContext): WorkerTurboModuleFactory | null {
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