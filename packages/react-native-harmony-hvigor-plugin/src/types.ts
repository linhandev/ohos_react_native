import { IFs } from 'memfs';

/**
 * @api
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
 * @api
 */
export type RNOHProjectPluginOptions = {
  nodeModulesPath?: string;
  bundler?: BundlerConfig | null;
};

/**
 * @api
 */
export class RNOHProjectPluginError extends Error {}

/**
 * @api
 */
export type CodegenConfig = {
  rnohModulePath: string;
  cppOutputPath?: string;
  projectRootPath?: string;
  debug?: boolean;
  noSafetyCheck?: boolean;
};

/**
 * @api
 */
export type MetroConfig = {
  port?: number;
};

/**
 * @api
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
 * @api
 */
export type RNOHModulePluginOptions = {
  nodeModulesPath?: string;
  metro?: MetroConfig | null;
  codegen: CodegenConfig | null;
  autolinking?: AutolinkingConfig | null;
};

/**
 * @api
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
