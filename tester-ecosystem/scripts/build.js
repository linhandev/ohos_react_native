// @ts-check
const pathUtils = require('path');
const {execSync} = require('child_process');
const DEVECO_SDK_HOME = process.env.DEVECO_SDK_HOME;

if (!DEVECO_SDK_HOME) {
  console.error('DEVECO_SDK_HOME is undefined');
  process.exit(1);
}

const nodePath = pathUtils.join(
  DEVECO_SDK_HOME,
  '..',
  'tools',
  'node',
  'bin',
  'node',
);

const ohpmPath = pathUtils.join(
  DEVECO_SDK_HOME,
  '..',
  'tools',
  'ohpm',
  'bin',
  'ohpm',
);

const hvigorwPath = pathUtils.join(
  DEVECO_SDK_HOME,
  '..',
  'tools',
  'hvigor',
  'bin',
  'hvigorw.js',
);

const buildCommand = `${nodePath} ${hvigorwPath} --mode module -p module=entry@default -p product=default -p requiredDeviceType=phone assembleHap --analyze=normal --parallel --incremental --daemon`;
const installCommand = `${ohpmPath} install`;

try {
  execSync(installCommand, {stdio: 'inherit', cwd: './harmony'});
  execSync(buildCommand, {stdio: 'inherit', cwd: './harmony'});
} catch (error) {
  console.error('Command execution failed:', error);
  process.exit(1);
}
