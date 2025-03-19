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

  const buildCommand = `"${nodePath}" "${hvigorwPath}" --mode module -p module=entry@default -p product=default -p requiredDeviceType=phone assembleHap --analyze=normal --parallel --incremental --daemon`;
  const installCommand = `"${ohpmPath}" install`;

  try {
    execSync(installCommand, {stdio: 'inherit', cwd: './harmony'});
    execSync(buildCommand, {stdio: 'inherit', cwd: './harmony'});
  } catch (error) {
    console.error('Command execution failed:', error);
    process.exit(1);
  }
})();
