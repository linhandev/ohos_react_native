/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//@ts-check
const pathUtils = require('path');
const fs = require('fs');
const colors = require('colors/safe');

const HARMONY_PLATFORM_NAME = 'harmony';
const RNOH_FALLBACK_PLATFORM_NAME = 'ios';

/**
 * @param msg {string}
 */
function info(msg) {
  const infoPrefix = '[' + colors.bold(colors.cyan(`INFO`)) + ']';
  console.log(infoPrefix, msg);
}

/**
 * @type {string | null}
 */
let REQUEST_RESOLUTION_LATEST_PLATFORM = null;

/**
 * @param options {import("./metro.config").HarmonyMetroConfigOptions}
 * @returns {import("metro-config").InputConfigT}
 */
function createHarmonyMetroConfig(options) {
  /**
   * The default value needs to be changed to @react-native-oh/react-native-harmony but this is a breaking change.
   */
  const reactNativeHarmonyPackageName =
    options?.reactNativeHarmonyPackageName ?? 'react-native-harmony';
  const reactNativeHarmonyPattern =
    options?.__reactNativeHarmonyPattern ??
    pathUtils.sep +
      reactNativeHarmonyPackageName.replace('/', pathUtils.sep) +
      pathUtils.sep;

  return {
    transformer: {
      assetRegistryPath: 'react-native/Libraries/Image/AssetRegistry',
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    serializer: {
      getModulesRunBeforeMainModule: () => {
        if (REQUEST_RESOLUTION_LATEST_PLATFORM !== 'harmony') {
          return [];
        }
        return [require.resolve('./Libraries/Core/InitializeCore')];
      },
    },
    resolver: {
      blockList: [/\.cxx/],
      resolveRequest: (ctx, moduleName, platform) => {
        REQUEST_RESOLUTION_LATEST_PLATFORM = platform;
        const nodeModulesPaths = [
          pathUtils.resolve('node_modules'),
          ...(ctx.nodeModulesPaths ?? []),
        ];
        if (platform === HARMONY_PLATFORM_NAME) {
          if (
            moduleName === 'react-native' ||
            moduleName.startsWith(`react-native/`)
          ) {
            /**
             * Importing from `react-native` when preparing offline bundle.
             */
            const newModuleName = moduleName.replace(
              'react-native',
              reactNativeHarmonyPackageName
            );
            try {
              return ctx.resolveRequest(
                ctx,
                newModuleName,
                HARMONY_PLATFORM_NAME
              );
            } catch {
              return ctx.resolveRequest(
                ctx,
                newModuleName,
                RNOH_FALLBACK_PLATFORM_NAME
              );
            }
          } else if (
            moduleName === reactNativeHarmonyPackageName ||
            moduleName.startsWith(`${reactNativeHarmonyPackageName}/`)
          ) {
            /**
             * Importing from `react-native` when bundle is provided from Metro server.
             *
             * `moduleName` is equal here to the value provided in
             * react-native-harmony/react-native.config.js::config::platforms::harmony::npmPackageName
             * when importing from `react-native`.
             */
            try {
              return ctx.resolveRequest(ctx, moduleName, HARMONY_PLATFORM_NAME);
            } catch {
              return ctx.resolveRequest(
                ctx,
                moduleName,
                RNOH_FALLBACK_PLATFORM_NAME
              );
            }
          } else if (ctx.originModulePath.includes(reactNativeHarmonyPattern)) {
            // Internal RN imports
            const maybeResult = resolveRequestOnlyForHarmony(ctx, moduleName);
            if (maybeResult) {
              return maybeResult;
            }
            return ctx.resolveRequest(
              ctx,
              moduleName,
              RNOH_FALLBACK_PLATFORM_NAME
            );
          } else if (
            isHarmonyPackageInternalImport(
              nodeModulesPaths,
              ctx.originModulePath,
              moduleName
            )
          ) {
            /**
             * Replace internal imports in `react-native-foo` with equivalent files from `react-native-harmony-foo`
             * if a package has internal import redirection enabled in its package.json configuration e.g.
             *
             * react-native-harmony-foo/package.json:
             *  "harmony": {
             *     "alias": "react-native-foo"
             *     "redirectInternalImports": true,
             *  }
             */
            const alias = getPackageNameFromOriginModulePath(
              ctx.originModulePath
            );

            if (alias) {
              const harmonyPackage =
                getHarmonyPackageByAliasMap(nodeModulesPaths);

              const harmonyPackageName = harmonyPackage[alias]?.name;

              const redirectInternalImports =
                harmonyPackage[alias]?.redirectInternalImports;

              if (
                harmonyPackageName &&
                !isRequestFromHarmonyPackage(
                  ctx.originModulePath,
                  harmonyPackageName
                ) &&
                redirectInternalImports
              ) {
                const moduleAbsPath = pathUtils.resolve(
                  pathUtils.dirname(ctx.originModulePath),
                  moduleName
                );

                const slashes = new RegExp('/', 'g');
                const [_, modulePathRelativeToOriginalPackage] =
                  moduleAbsPath.split(
                    `${pathUtils.sep}node_modules${
                      pathUtils.sep
                    }${alias.replace(slashes, pathUtils.sep)}${pathUtils.sep}`
                  );
                const backslashes = new RegExp('\\\\', 'g');
                const newModuleName = `${harmonyPackageName}/${modulePathRelativeToOriginalPackage.replace(
                  backslashes,
                  '/'
                )}`;
                try {
                  return ctx.resolveRequest(
                    ctx,
                    newModuleName,
                    HARMONY_PLATFORM_NAME
                  );
                } catch (err) {}
              } else {
              }
            }
          } else {
            /**
             * Replace `react-native-foo` with `react-native-harmony-foo` if a package has harmony directory and proper package.json configuration e.g.
             *
             * react-native-harmony-foo/package.json:
             *  "harmony": {
             *     "alias": "react-native-foo"
             *  }
             */
            const harmonyPackageByAlias =
              getHarmonyPackageByAliasMap(nodeModulesPaths);
            const alias = getPackageName(moduleName);
            if (alias) {
              const harmonyPackageName = harmonyPackageByAlias[alias]?.name;
              if (
                harmonyPackageName &&
                !isRequestFromHarmonyPackage(
                  ctx.originModulePath,
                  harmonyPackageName
                )
              ) {
                return ctx.resolveRequest(
                  ctx,
                  moduleName.replace(alias, harmonyPackageName),
                  platform
                );
              }
            }
          }
        }
        return ctx.resolveRequest(ctx, moduleName, platform);
      },
    },
  };
}

module.exports = {
  createHarmonyMetroConfig,
};

/**
 * Let's say we have following files:
 * foo.js
 * foo.harmony.tsx
 *
 * By default, in that situation foo.js will be resolved. This function however chooses foo.harmony.tsx.
 * In the past, RNOH redirected imports back to the RN package, and RNOH used different extensions than original files.
 *
 * @param ctx {Parameters<NonNullable<import("metro-config").ResolverConfigT["resolveRequest"]>>[0]}
 * @param moduleName {string}
 */
function resolveRequestOnlyForHarmony(ctx, moduleName) {
  for (const sourceExt of ctx.sourceExts) {
    const newCtx = { ...ctx };
    newCtx.sourceExts = [sourceExt];
    try {
      const result = ctx.resolveRequest(
        newCtx,
        moduleName,
        HARMONY_PLATFORM_NAME
      );
      if (result.type === 'sourceFile') {
        const lastDotIndex = result.filePath.lastIndexOf('.');
        const beforeLastDot = result.filePath.substring(0, lastDotIndex);
        if (beforeLastDot.endsWith('.' + HARMONY_PLATFORM_NAME)) {
          return result;
        }
      }
    } catch {}
  }
  return null;
}

/**
 * @param moduleName {string}
 * @returns {string | null}
 */
function getPackageName(moduleName) {
  if (moduleName.startsWith('.')) return null;
  if (moduleName.startsWith('@')) {
    const segments = moduleName.split('/', 3);
    if (segments.length == 2) {
      return moduleName;
    } else if (segments.length > 2) {
      return `${segments[0]}/${segments[1]}`;
    }
    return null;
  }
  if (moduleName.includes('/')) {
    return moduleName.split('/')[0];
  } else {
    return moduleName;
  }
}

/**
 * @param originModulePath {string}
 * @returns {string}
 */
function getPackageNameFromOriginModulePath(originModulePath) {
  const nodeModulesPosition = originModulePath.search('node_modules');
  const pathRelativeToNodeModules =
    originModulePath.substring(nodeModulesPosition);
  const pathSegments = pathRelativeToNodeModules.split(pathUtils.sep);
  const module = pathSegments[1];
  if (module.startsWith('@')) {
    return `${pathSegments[1]}/${pathSegments[2]}`;
  } else {
    return pathSegments[1];
  }
}

/**
 * @param nodeModulesPaths {readonly string[]}
 * @param originModulePath {string}
 * @param moduleName {string}
 * @returns {boolean}
 */
function isHarmonyPackageInternalImport(
  nodeModulesPaths,
  originModulePath,
  moduleName
) {
  if (moduleName.startsWith('.')) {
    const alias = getPackageNameFromOriginModulePath(originModulePath);
    const slashes = new RegExp('/', 'g');
    if (
      alias &&
      originModulePath.includes(
        `${pathUtils.sep}node_modules${pathUtils.sep}${alias.replace(
          slashes,
          pathUtils.sep
        )}${pathUtils.sep}`
      )
    ) {
      const harmonyPackage = getHarmonyPackageByAliasMap(nodeModulesPaths);
      const harmonyPackageName = harmonyPackage[alias]?.name;
      if (
        harmonyPackageName &&
        !isRequestFromHarmonyPackage(originModulePath, harmonyPackageName)
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * @param originModulePath {string}
 * @param harmonyPackageName {string}
 * @returns {boolean}
 */
function isRequestFromHarmonyPackage(originModulePath, harmonyPackageName) {
  const slashes = new RegExp('/', 'g');
  const packagePath = harmonyPackageName.replace(slashes, pathUtils.sep);

  return originModulePath.includes(
    `${pathUtils.sep}node_modules${pathUtils.sep}${packagePath}${pathUtils.sep}`
  );
}

/**
 * @type {Record<string, {name: string, redirectInternalImports: boolean}> | undefined}
 */
let cachedHarmonyPackageByAliasMap = undefined;

/**
 * @param nodeModulesPaths {readonly string[]}
 */
function getHarmonyPackageByAliasMap(nodeModulesPaths) {
  /**
   * @type {Record<string, {name: string, redirectInternalImports: boolean}>}
   */
  const initialAcc = {};
  if (cachedHarmonyPackageByAliasMap) {
    return cachedHarmonyPackageByAliasMap;
  }
  cachedHarmonyPackageByAliasMap = findHarmonyNodeModulePaths(
    findHarmonyNodeModuleSearchPaths(nodeModulesPaths)
  ).reduce((acc, harmonyNodeModulePath) => {
    const harmonyNodeModulePathSegments = harmonyNodeModulePath.split(
      pathUtils.sep
    );
    let harmonyNodeModuleName =
      harmonyNodeModulePathSegments[harmonyNodeModulePathSegments.length - 1];
    if (harmonyNodeModulePathSegments.length > 1) {
      const harmonyNodeModuleParentDirName =
        harmonyNodeModulePathSegments[harmonyNodeModulePathSegments.length - 2];
      if (harmonyNodeModuleParentDirName.startsWith('@')) {
        harmonyNodeModuleName = `${harmonyNodeModuleParentDirName}/${harmonyNodeModuleName}`;
      }
    }
    const packageJsonPath = `${harmonyNodeModulePath}${pathUtils.sep}package.json`;
    const packageJson = readHarmonyModulePackageJSON(packageJsonPath);
    const alias = packageJson.harmony?.alias;
    const redirectInternalImports =
      packageJson?.harmony?.redirectInternalImports ?? false;
    if (alias) {
      acc[alias] = {
        name: harmonyNodeModuleName,
        redirectInternalImports: redirectInternalImports,
      };
    }
    return acc;
  }, initialAcc);
  const harmonyPackagesCount = Object.keys(
    cachedHarmonyPackageByAliasMap
  ).length;
  if (harmonyPackagesCount > 0) {
    const prettyHarmonyPackagesCount = colors.bold(
      harmonyPackagesCount > 0
        ? colors.green(harmonyPackagesCount.toString())
        : harmonyPackagesCount.toString()
    );
    info(
      `Redirected imports to ${prettyHarmonyPackagesCount} harmony-specific third-party package(s):`
    );
    if (harmonyPackagesCount > 0) {
      Object.entries(cachedHarmonyPackageByAliasMap).forEach(
        ([original, { name: alias }]) => {
          info(
            `• ${colors.bold(colors.gray(original))} → ${colors.bold(alias)}`
          );
        }
      );
    }
  } else {
    info('No harmony-specific third-party packages have been detected');
  }
  console.log('');
  return cachedHarmonyPackageByAliasMap;
}

/**
 * @param nodeModulesPaths {readonly string[]}
 * @returns {string[]}
 */
function findHarmonyNodeModuleSearchPaths(nodeModulesPaths) {
  /**
   * @type string[]
   */
  let searchPaths = [];
  for (const nodeModulesPath of nodeModulesPaths) {
    if (fs.existsSync(nodeModulesPath)) {
      fs.readdirSync(nodeModulesPath)
        .filter((dirName) => dirName.startsWith('@'))
        .forEach((dirName) =>
          searchPaths.push(`${nodeModulesPath}${pathUtils.sep}${dirName}`)
        );
      searchPaths.push(nodeModulesPath);
    }
  }
  return searchPaths;
}

/**
 * @param searchPaths {string[]}
 * @returns {string[]}
 */
function findHarmonyNodeModulePaths(searchPaths) {
  return searchPaths
    .map((searchPath) => {
      return fs
        .readdirSync(searchPath, { withFileTypes: true })
        .map((dirent) => {
          const direntPath =
            (dirent.parentPath ?? dirent.path) + pathUtils.sep + dirent.name;

          if (dirent.isSymbolicLink()) {
            return pathUtils.resolve(fs.readlinkSync(direntPath));
          } else {
            return direntPath;
          }
        })
        .map((potentialHarmonyNodeModulePath) => {
          return potentialHarmonyNodeModulePath;
        })
        .filter(hasPackageJSON);
    })
    .flat();
}

/**
 * @param nodeModulePath {string}
 * @returns {boolean}
 */
function hasPackageJSON(nodeModulePath) {
  if (!fs.existsSync(nodeModulePath)) {
    return false;
  }
  if (!fs.lstatSync(nodeModulePath).isDirectory()) return false;
  const nodeModuleContentNames = fs.readdirSync(nodeModulePath);
  return nodeModuleContentNames.includes('package.json');
}

/**
 * @param packageJSONPath {string}
 * @returns {{name: string, harmony?: {alias?: string, redirectInternalImports?: boolean}}}
 */
function readHarmonyModulePackageJSON(packageJSONPath) {
  return JSON.parse(fs.readFileSync(packageJSONPath).toString());
}
