import { Command } from './types';
import fs from 'fs';
import fse from 'fs-extra';
import Metro from 'metro';
import { RunBuildOptions as BuildOptions } from 'metro';
import MetroServer from 'metro/src/Server';
import pathUtils from 'path';
import { getAssetDestRelativePath } from '../assetResolver';
import { ConfigT as MetroConfig } from 'metro-config';
import { execSync } from 'child_process';

const HERMESC_BIN_DIR = {
  darwin: 'osx-bin',
  linux: 'linux64-bin',
  win32: 'win64-bin',
};
const HERMESC_PATH_PREFIX = './node_modules/react-native/sdks/hermesc/';
const ARK_RESOURCE_PATH = './harmony/entry/src/main/resources/rawfile';
const ASSETS_DEFAULT_DEST_PATH =
  './harmony/entry/src/main/resources/rawfile/assets';
const TMP_BUNDLE_PATH = '/tmp/bundle.harmony.js';

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
    },
    {
      name: '--config <path>',
      description: 'Path to the Metro configuration file',
    },
    {
      name: '--bundle-output <path>',
      description:
        'File name where to store the resulting bundle, ex. /tmp/groups.bundle',
      default: ARK_RESOURCE_PATH + '/bundle.harmony.js',
    },
    {
      name: '--assets-dest <path>',
      description:
        'Directory name where to store assets referenced in the bundle',
      default: ASSETS_DEFAULT_DEST_PATH,
    },
    {
      name: '--sourcemap-output <path>',
      description:
        'File name where to store the resulting source map, ex. /tmp/groups.map',
    },
    {
      name: '--minify [boolean]',
      description: 'Allows overriding whether bundle is minified',
      parse: (val: string) => val !== 'false',
    },
    {
      name: '--hbc-bundle [boolean]',
      description:
        'Generates the bundle in HBC format. True by default when --dev is set to false.',
    },
    {
      name: '--hermesc-options <string...>',
      description:
        'Additional options to pass to hermesc when generating HBC bundle. Example: --hermesc-options O g reuse-prop-cache.',
      parse: (val, prev) => (prev ? [...prev, val] : [val]),
    },
  ],
  func: async (argv, config, args: any) => {
    const buildOptions: BuildOptions = {
      entry: args.entryFile,
      platform: 'harmony',
      minify: args.minify !== undefined ? args.minify : !args.dev,
      dev: args.dev,
      sourceMap: args.sourcemapOutput,
      sourceMapUrl: args.sourcemapOutput,
    };
    const metroConfig = await loadMetroConfig(args.config);
    const bundle = await createBundle(metroConfig, buildOptions);
    await saveBundle(
      bundle,
      args.bundleOutput,
      args.sourcemapOutput,
      args.hbcBundle !== undefined
        ? stringToBoolean(args.hbcBundle)
        : !args.dev,
      args.hermescOptions
    );
    const assets = await retrieveAssetsData(metroConfig, buildOptions);
    copyAssets(assets, args.assetsDest);
  },
};

async function loadMetroConfig(
  configPath: Path | undefined
): Promise<MetroConfig> {
  return configPath
    ? await Metro.loadConfig({ config: configPath })
    : await Metro.loadConfig();
}

async function createBundle(
  metroConfig: MetroConfig,
  buildOptions: BuildOptions
): Promise<Bundle> {
  // casting needed as Metro.runBuild returns Promise<{code: string, map: string}>
  // despite being typed as Promise<void>
  return (await Metro.runBuild(metroConfig, buildOptions)) as unknown as Bundle;
}

async function saveHBCBundle(
  bundleCode: string,
  bundleOutput: Path,
  hermescOptions: string[] | undefined
) {
  if (
    process.platform !== 'darwin' &&
    process.platform !== 'linux' &&
    process.platform !== 'win32'
  ) {
    throw new Error(`Unsupported platform ${process.platform} (⊙︿⊙)`);
  }
  const resolvedHermescPath = pathUtils.join(
    HERMESC_PATH_PREFIX,
    HERMESC_BIN_DIR[process.platform as OSType],
    'hermesc'
  );
  await fse.ensureFile(resolvedHermescPath);
  await fse.writeFile(TMP_BUNDLE_PATH, bundleCode);
  const hbcFilePath = bundleOutput.endsWith('.hbc')
    ? bundleOutput
    : pathUtils.join(pathUtils.dirname(bundleOutput), 'hermes_bundle.hbc');
  const hermescOptionsString =
    hermescOptions?.map((e) => `-${e}`).join(' ') || '';
  execSync(
    `${resolvedHermescPath} ${hermescOptionsString} --emit-binary -out ${hbcFilePath} ${TMP_BUNDLE_PATH}`,
    {
      stdio: 'inherit',
    }
  );
  fs.unlinkSync(TMP_BUNDLE_PATH);
  console.log(`[CREATED] ${hbcFilePath}`);
}

async function saveBundle(
  bundle: Bundle,
  bundleOutput: Path,
  sourceMapOutput: Path | undefined,
  hbcBundle: boolean,
  hermescOptions: string[] | undefined
) {
  await fse.ensureDir(pathUtils.dirname(bundleOutput));

  if (hbcBundle) {
    await saveHBCBundle(bundle.code, bundleOutput, hermescOptions);
  } else {
    fs.writeFileSync(bundleOutput, bundle.code);
    console.log(`[CREATED] ${bundleOutput}`);
  }

  if (sourceMapOutput) {
    fs.writeFileSync(sourceMapOutput, bundle.map);
    console.log(`[CREATED] ${sourceMapOutput}`);
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
  assetsData: readonly AssetData[],
  assetsDest: Path
): Promise<void> {
  if (assetsDest == null) {
    console.warn('Assets destination folder is not set, skipping...');
    return;
  }
  await fse.ensureDir(assetsDest);
  const fileDestBySrc: Record<Path, Path> = {};
  for (const asset of assetsData) {
    const idx = getHighestQualityFileIdx(asset);
    fileDestBySrc[asset.files[idx]] = pathUtils.join(
      assetsDest,
      getAssetDestRelativePath(asset)
    );
  }
  return copyFiles(fileDestBySrc);
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

function copyFiles(fileDestBySrc: Record<Path, Path>) {
  const fileSources = Object.keys(fileDestBySrc);
  if (fileSources.length === 0) {
    return Promise.resolve();
  }

  console.info(`Copying ${fileSources.length} asset files`);
  return new Promise<void>((resolve, reject) => {
    const copyNext = (error?: Error) => {
      if (error) {
        reject(error);
        return;
      }
      if (fileSources.length === 0) {
        console.info('Done copying assets');
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
  onFinished: (error: Error) => void
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

function stringToBoolean(value: string): boolean {
  return value.toLowerCase() === 'true';
}
