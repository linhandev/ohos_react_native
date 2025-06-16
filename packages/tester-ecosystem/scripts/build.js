// @ts-check
const {execSync} = require('node:child_process');
const {glob} = require('glob');
const pathUtils = require('node:path');

/**
 * @param {string} directory
 * @param {string} filename
 */
async function findFirstFile(directory, filename) {
  try {
    const files = await glob(`${directory}/**/${filename}`, {nodir: true});
    return files.length > 0 ? files[0] : null;
  } catch (err) {
    console.error(`Error searching for ${filename}: ${err}`);
    return null;
  }
}

(async () => {
  const DEVECO_SDK_HOME = process.env.DEVECO_SDK_HOME;
  const RNOH_NATIVE_PROJECT_HOME = pathUtils.join(
    __dirname,
    '..',
    '..',
    'tester',
    'harmony',
  );

  if (!DEVECO_SDK_HOME) {
    console.error('DEVECO_SDK_HOME is undefined');
    process.exit(1);
  }

  const basePath = pathUtils.join(DEVECO_SDK_HOME, '..');
  const nodePath = await findFirstFile(
    basePath,
    'node' + (process.platform === 'win32' ? '.exe' : ''),
  );
  const hvigorwPath = await findFirstFile(basePath, 'hvigorw.js');
  const ohpmPath = await findFirstFile(basePath, 'ohpm');

  const syncCommand = `"${nodePath}" "${hvigorwPath}" --sync -p product=default --analyze=false --parallel --incremental --no-daemon`;
  const packHarCommand = `"${nodePath}" "${hvigorwPath}" --mode module -p product=default -p module=react_native_openharmony@default -p buildMode=release assembleHar --error --analyze=false --parallel --incremental --no-daemon`;
  const installCommand = `"${ohpmPath}" install`;
  const buildCommand = `"${nodePath}" "${hvigorwPath}" --mode module -p module=entry@default -p product=default -p buildMode=release -p requiredDeviceType=phone assembleHap --analyze=normal --parallel --incremental --no-daemon --debug`;

  try {
    execSync(syncCommand, {
      stdio: 'inherit',
      cwd: RNOH_NATIVE_PROJECT_HOME,
    });
    execSync(packHarCommand, {
      stdio: 'inherit',
      cwd: RNOH_NATIVE_PROJECT_HOME,
    });
    execSync(installCommand, {stdio: 'inherit', cwd: './harmony'});
    execSync(buildCommand, {stdio: 'inherit', cwd: './harmony'});
  } catch (error) {
    console.error('Command execution failed:', error);
    process.exit(1);
  }
})();
