import fs from 'node:fs';
import pathUtils from 'node:path';
import { execSync } from 'child_process';
import { unlinkSync } from 'fs';

const repoRootPath = pathUtils.resolve(__dirname, '..');
const rnohPkgRootPath = pathUtils.join(
  repoRootPath,
  'packages',
  'react-native-harmony'
);
const reactNativePkgRootPath = pathUtils.join(
  repoRootPath,
  'packages',
  'react-native-core',
  'packages',
  'react-native'
);

const reactCommonSrcPath = pathUtils.join(
  reactNativePkgRootPath,
  'ReactCommon'
);

const reactCommonDestPath = pathUtils.join(
  repoRootPath,
  'packages',
  'tester',
  'harmony',
  'react_native_openharmony',
  'src',
  'main',
  'cpp',
  'third-party',
  'rn',
  'ReactCommon'
);

syncJS('delegates');
syncJS('Libraries');
syncJS('src');
syncJS('types');
syncCpp();

function syncJS(pathRelativeToRNRoot: string) {
  const destPath = pathUtils.join(rnohPkgRootPath, pathRelativeToRNRoot);
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath);
  }
  removeUntrackedFiles(destPath);
  fs.cpSync(
    pathUtils.join(reactNativePkgRootPath, pathRelativeToRNRoot),
    destPath,
    { recursive: true }
  );
  console.log(`synchronized: ${pathUtils.relative(process.cwd(), destPath)}`);
}

function removeUntrackedFiles(dirPath: string): void {
  const stdout = execSync('git ls-files --others', {
    cwd: dirPath,
    encoding: 'utf-8',
  });
  const files = stdout.split('\n').filter((file) => file);

  files.forEach((file) => {
    const fullPath = pathUtils.resolve(dirPath, file);
    unlinkSync(fullPath);
  });
}

function syncCpp() {
  if (!fs.existsSync(reactCommonDestPath)) {
    fs.mkdirSync(reactCommonDestPath);
  }
  removeUntrackedFiles(reactCommonDestPath);
  fs.cpSync(reactCommonSrcPath, reactCommonDestPath, { recursive: true });
  console.log(
    `synchronized: ${pathUtils.relative(process.cwd(), reactCommonDestPath)}`
  );
}
