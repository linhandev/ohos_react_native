import { IFs } from 'memfs';

/**
 * @actor RNOH_APP
 */
export type BundlerConfig = {
  enabled?: boolean;
  dev?: boolean;
  entryFile?: string;
  config?: string;
  bundleOutput?: string;
  jsEngine?: string;
  assetsDest?: string;
  sourcemapOutput?: string;
  minify?: boolean;
  hermescOptions?: string;
};

/**
 * @actor RNOH_APP
 */
export type RNOHProjectPluginOptions = {
  nodeModulesPath?: string;
  bundler?: BundlerConfig | null;
};

/**
 * @actor RNOH_APP
 */
export class RNOHProjectPluginError extends Error {}

/**
 * @actor RNOH_APP
 */
export type CodegenConfig = {
  rnohModulePath: string;
  cppOutputPath?: string;
  projectRootPath?: string;
  debug?: boolean;
  noSafetyCheck?: boolean;
};

/**
 * @actor RNOH_APP
 */
export type MetroConfig = {
  port?: number;
};

/**
 * @actor RNOH_APP
 */
export type AutolinkingConfig = {
  ohPackagePath?: string;
  etsRNOHPackagesFactoryPath?: string;
  cppRNOHPackagesFactoryPath?: string;
  cmakeAutolinkPath?: string;
  excludeNpmPackages?: string[];
  includeNpmPackages?: string[];
};

/**
 * @actor RNOH_APP
 */
export type RNOHModulePluginOptions = {
  nodeModulesPath?: string;
  metro?: MetroConfig | null;
  codegen: CodegenConfig | null;
  autolinking?: AutolinkingConfig | null;
};

/**
 * @actor RNOH_APP
 */
export class RNOHModulePluginError extends Error {}

export type FS = Pick<IFs, 'existsSync'>;

export interface ILogger {
  info(message: string): void;

  warn(message: string): void;

  error(message: string): void;
}

export interface Subtask {
  run(): void;
}
