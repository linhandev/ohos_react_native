import { Command } from './types';
import fs from 'node:fs';
import os from 'os';
import fse from 'fs-extra';
import Metro from 'metro';
import { RunBuildOptions as BuildOptions } from 'metro';
import MetroServer from 'metro/src/Server';
import pathUtils from 'path';
import { getAssetDestRelativePath } from '../assetResolver';
import { execSync } from 'child_process';
import { Logger } from '../io';
import { DescriptiveError } from '../core';
import { randomUUID } from 'node:crypto';

type MetroConfig = Awaited<ReturnType<typeof Metro.loadConfig>>;

const HERMESC_BIN_PATH = {
  darwin: pathUtils.normalize('osx-bin/hermesc'),
  linux: pathUtils.normalize('linux64-bin/hermesc'),
  win32: pathUtils.normalize('win64-bin/hermesc.exe'),
};
const HERMESC_PATH_PREFIX = pathUtils.normalize(
  './node_modules/react-native/sdks/hermesc/'
);
const HARMONY_RESOURCE_PATH = pathUtils.normalize(
  './harmony/entry/src/main/resources/rawfile'
);
const ASSETS_DEFAULT_DEST_PATH = pathUtils.normalize(
  './harmony/entry/src/main/resources/rawfile/assets'
);

type AssetData = Metro.AssetData;
type Bundle = { code: string; map: string };
type Path = string;
type OSType = 'darwin' | 'linux' | 'win32';

export const commandBundleHarmony: Command = {
  name: 'bundle-harmony',
  description:
    'Creates JS bundle, creates a special cpp header containing the JS code, copies assets directory to the project.',
  options: [
    {
      name: '--dev [boolean]',
      description: 'If false, warnings are disabled and the bundle is minified',
      parse: (val: string) => val !== 'false',
      default: true,
    },
    {
      name: '--entry-file <path>',
      description:
        'Path to the root JS file, either absolute or relative to JS root',
      default: 'index.js',
      parse: (val: string) => pathUtils.normalize(val),
    },
    {
      name: '--reset-cache',
      description: 'Removes cached files',
      default: false,
    },
    {
      name: '--config <path>',
      description: 'Path to the Metro configuration file',
      parse: (val: string) => pathUtils.normalize(val),
    },
    {
      name: '--bundle-output <path>',
      description: `File path where to store the resulting bundle (default: "${HARMONY_RESOURCE_PATH}${pathUtils.sep}bundle.harmony.js")`,
      parse: (val: string) => pathUtils.normalize(val),
    },
    {
      name: '--js-engine <string>',
      description:
        'JavaScript engine used to run the bundle. Supported engines: "hermes" and "any" (default: "any"). Setting this option to "hermes" will generate a HBC bundle instead of a JS bundle.',
      default: 'any',
      parse: (val: string) => {
        if (val !== 'any' && val !== 'hermes') {
          throw new Error(
            `Only "any" and "hermes" are supported as JavaScript engines, but "${val}" was provided`
          );
        }
        return val;
      },
    },
    {
      name: '--assets-dest <path>',
      description:
        'Directory name where to store assets referenced in the bundle',
      default: ASSETS_DEFAULT_DEST_PATH,
      parse: (val: string) => pathUtils.normalize(val),
    },
    {
      name: '--sourcemap-output <path>',
      description:
        'File name where to store the resulting source map, ex. /tmp/groups.map',
      parse: (val: string) => pathUtils.normalize(val),
    },
    {
      name: '--minify [boolean]',
      description: 'Allows overriding whether bundle is minified',
      parse: (val: string) => val !== 'false',
    },
    {
      name: '--hermesc-dir <path>',
      description:
        'Path to hermesc directory. Relevant when --js-engine set to "hermes".',
      default: HERMESC_PATH_PREFIX,
      parse: (val: string) => pathUtils.normalize(val),
    },
    {
      name: '--hermesc-options <string...>',
      description:
        'Additional options to pass to hermesc when generating HBC bundle. Example: --hermesc-options O g reuse-prop-cache. Relevant when --js-engine set to "hermes".',
      parse: (val, prev) => (prev ? [...prev, val] : [val]),
    },
  ],
  func: async (argv, config, args: any) => {
    const logger = new Logger();
    try {
      const defaultBundleName =
        args.jsEngine === 'hermes' ? 'hermes_bundle.hbc' : 'bundle.harmony.js';
      const bundleOutput: string =
        args.bundleOutput ??
        `${HARMONY_RESOURCE_PATH}${pathUtils.sep}${defaultBundleName}`;
      const shouldGenerateHbcBundle = bundleOutput
        .toLowerCase()
        .endsWith('hbc');
      await fse.ensureDir(pathUtils.dirname(bundleOutput));
      const assetsDest: Path = args.assetsDest;
      await fse.ensureDir(assetsDest);
      const buildOptions: BuildOptions = {
        entry: args.entryFile,
        platform: 'harmony',
        minify: args.minify !== undefined ? args.minify : !args.dev,
        dev: args.dev,
        sourceMap: args.sourcemapOutput,
        sourceMapUrl: args.sourcemapOutput,
      };
      const metroConfig = await loadMetroConfig({
        config: args.config,
        resetCache: args.resetCache,
      });

      const bundle = await createBundle(metroConfig, buildOptions);
      const assets = await retrieveAssetsData(metroConfig, buildOptions);

      if (shouldGenerateHbcBundle) {
        await saveHbcBundle(
          logger,
          bundle.code,
          bundleOutput,
          args.hermescDir,
          args.hermescOptions
        );
      } else {
        await saveJSBundle(logger, bundle, bundleOutput);
      }
      maybeSaveSourceMap(logger, bundle, args.sourcemapOutput);
      await copyAssets(logger, assets, assetsDest);
    } catch (err) {
      if (err instanceof DescriptiveError) {
        logger.descriptiveError(err);
        return;
      } else {
        throw err;
      }
    }
  },
};

async function loadMetroConfig(options: {
  config: Path | undefined;
  resetCache: boolean;
}): Promise<MetroConfig> {
  if (!options.config) {
    delete options.config;
  }
  return await Metro.loadConfig(options);
}

async function createBundle(
  metroConfig: MetroConfig,
  buildOptions: BuildOptions
): Promise<Bundle> {
  // casting needed as Metro.runBuild returns Promise<{code: string, map: string}>
  // despite being typed as Promise<void>
  return (await Metro.runBuild(metroConfig, buildOptions)) as unknown as Bundle;
}

async function saveHbcBundle(
  logger: Logger,
  bundleCode: string,
  bundleOutput: Path,
  hermescPath: string,
  hermescOptions: string[] | undefined
) {
  if (
    process.platform !== 'darwin' &&
    process.platform !== 'linux' &&
    process.platform !== 'win32'
  ) {
    throw new Error(`Unsupported platform ${process.platform} (⊙︿⊙)`);
  }
  const resolvedHermescPath = pathUtils.resolve(
    hermescPath,
    HERMESC_BIN_PATH[process.platform as OSType]
  );

  if (!fs.existsSync(resolvedHermescPath)) {
    throw new DescriptiveError({
      whatHappened: `Couldn't find hermesc at ${resolvedHermescPath}`,
      whatCanUserDo: [
        'Find hermesc dir and provide it by using --hermesc-dir argument. hermesc dir should be in react-native package.',
      ],
    });
  }

  const tmpBundlePath = `${os.tmpdir()}${pathUtils.sep}b-${randomUUID()}.harmony.js`;
  await fse.writeFile(tmpBundlePath, bundleCode);
  const hbcFilePath = bundleOutput.endsWith('.hbc')
    ? bundleOutput
    : pathUtils.join(pathUtils.dirname(bundleOutput), 'hermes_bundle.hbc');
  const hermescOptionsString =
    hermescOptions?.map((e) => `-${e}`).join(' ') || '';
  execSync(
    `${resolvedHermescPath} ${hermescOptionsString} --emit-binary -out ${hbcFilePath} ${tmpBundlePath}`,
    {
      stdio: 'inherit',
    }
  );
  fs.unlinkSync(tmpBundlePath);
  logger.info((s) => `Created ${hbcFilePath}`);
}

async function saveJSBundle(
  logger: Logger,
  bundle: Bundle,
  bundleOutput: Path
) {
  fs.writeFileSync(bundleOutput, bundle.code);
  logger.info((s) => `Created ${bundleOutput}`);
}

function maybeSaveSourceMap(
  logger: Logger,
  bundle: Bundle,
  sourceMapOutput: Path | undefined
) {
  if (sourceMapOutput) {
    fs.writeFileSync(sourceMapOutput, bundle.map);
    logger.info((s) => `Created ${sourceMapOutput}`);
  }
}

async function retrieveAssetsData(
  metroConfig: MetroConfig,
  buildOptions: BuildOptions
): Promise<readonly AssetData[]> {
  const metroServer = new MetroServer(metroConfig);
  try {
    return await metroServer.getAssets({
      ...MetroServer.DEFAULT_BUNDLE_OPTIONS,
      ...buildOptions,
      entryFile: buildOptions.entry,
      bundleType: 'todo',
    });
  } finally {
    metroServer.end();
  }
}

async function copyAssets(
  logger: Logger,
  assetsData: readonly AssetData[],
  assetsDest: Path
): Promise<void> {
  if (assetsDest == null) {
    logger.warn((s) => 'Assets destination folder is not set, skipping...');
    return;
  }
  const fileDestBySrc: Record<Path, Path> = {};
  for (const asset of assetsData) {
    const idx = getHighestQualityFileIdx(asset);
    fileDestBySrc[asset.files[idx]] = pathUtils.join(
      assetsDest,
      getAssetDestRelativePath(asset)
    );
  }
  return copyFiles(logger, fileDestBySrc);
}

function getHighestQualityFileIdx(assetData: AssetData): number {
  let result = 0;
  let maxScale = -1;
  for (let idx = 0; idx < assetData.scales.length; idx++) {
    const scale = assetData.scales[idx];
    if (scale > maxScale) {
      maxScale = scale;
      result = idx;
    }
  }
  return result;
}

function copyFiles(logger: Logger, fileDestBySrc: Record<Path, Path>) {
  const fileSources = Object.keys(fileDestBySrc);
  if (fileSources.length === 0) {
    return Promise.resolve();
  }

  const assetFilesCount = fileSources.length;
  return new Promise<void>((resolve, reject) => {
    const copyNext = (error?: Error) => {
      if (error) {
        reject(error);
        return;
      }
      if (fileSources.length === 0) {
        logger.info(
          () =>
            `Copied ${assetFilesCount} ${
              assetFilesCount === 1 ? 'asset' : 'assets'
            }`
        );
        resolve();
      } else {
        // fileSources.length === 0 is checked in previous branch, so this is string
        const src = fileSources.shift()!;
        const dest = fileDestBySrc[src];
        copyFile(src, dest, copyNext);
      }
    };
    copyNext();
  });
}

function copyFile(
  src: string,
  dest: string,
  onFinished: (error?: Error) => void
): void {
  const destDir = pathUtils.dirname(dest);
  fs.mkdir(destDir, { recursive: true }, (err?) => {
    if (err) {
      onFinished(err);
      return;
    }
    fs.createReadStream(src)
      .pipe(fs.createWriteStream(dest))
      .on('finish', onFinished);
  });
}
