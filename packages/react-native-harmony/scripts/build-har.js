// @ts-check
const pathUtils = require('node:path');
const { execSync } = require('node:child_process');
const fs = require('node:fs');

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
  'node'
);

const hvigorwPath = pathUtils.join(
  DEVECO_SDK_HOME,
  '..',
  'tools',
  'hvigor',
  'bin',
  'hvigorw.js'
);

try {
  const buildHarCommand = `${nodePath} ${hvigorwPath} --mode module -p product=default -p module=react_native_openharmony@default -p buildMode=release assembleHar --analyze=normal --parallel --incremental --daemon`;
  execSync(buildHarCommand, { stdio: 'inherit', cwd: '../tester/harmony' });
  if (!fs.existsSync('./harmony')) {
    fs.mkdirSync('./harmony/');
  }
  fs.copyFileSync(
    '../tester/harmony/react_native_openharmony/build/default/outputs/default/react_native_openharmony.har',
    './harmony/react_native_openharmony.har'
  );
  process.exit(0);
} catch (error) {
  console.error('Command execution failed:', error);
  process.exit(1);
}
