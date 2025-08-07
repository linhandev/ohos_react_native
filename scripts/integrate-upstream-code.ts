import fs from 'node:fs';
import pathUtils from 'node:path';
import { execSync } from 'child_process';
import { unlinkSync } from 'fs';

const REPO_ROOT_PATH = pathUtils.resolve(__dirname, '..');
const RNOH_PKG_ROOT_PATH = pathUtils.join(
  REPO_ROOT_PATH,
  'packages',
  'react-native-harmony'
);

const REACT_NATIVE_SUBMODULE_PATH = pathUtils.join(
  REPO_ROOT_PATH,
  'packages',
  'react-native'
);

const REACT_NATIVE_PATCH_PATH = pathUtils.join(
  REPO_ROOT_PATH,
  'packages',
  'react-native.patch'
);

const REACT_NATIVE_PKG_ROOT_PATH = pathUtils.join(
  REACT_NATIVE_SUBMODULE_PATH,
  'packages',
  'react-native'
);

const REACT_COMMON_SRC_PATH = pathUtils.join(
  REACT_NATIVE_PKG_ROOT_PATH,
  'ReactCommon'
);

const REACT_COMMON_DEST_PATH = pathUtils.join(
  REPO_ROOT_PATH,
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

try {
  applyPatch();
  syncJS('delegates');
  syncJS('Libraries');
  syncJS('src');
  syncJS('types');
  syncCpp();
} finally {
  cleanReactNativeSubmodule();
}

function applyPatch() {
  cleanReactNativeSubmodule();
  execSync(`git apply --whitespace=fix ${REACT_NATIVE_PATCH_PATH}`, {
    cwd: REACT_NATIVE_SUBMODULE_PATH,
  });
}

function cleanReactNativeSubmodule() {
  execSync('git reset --hard HEAD && git clean -dfx', {
    cwd: REACT_NATIVE_SUBMODULE_PATH,
  });
}

function syncJS(pathRelativeToRNRoot: string) {
  const destPath = pathUtils.join(RNOH_PKG_ROOT_PATH, pathRelativeToRNRoot);
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath);
  }
  removeUntrackedFiles(destPath);
  fs.cpSync(
    pathUtils.join(REACT_NATIVE_PKG_ROOT_PATH, pathRelativeToRNRoot),
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
  if (!fs.existsSync(REACT_COMMON_DEST_PATH)) {
    fs.mkdirSync(REACT_COMMON_DEST_PATH);
  }
  removeUntrackedFiles(REACT_COMMON_DEST_PATH);
  fs.cpSync(REACT_COMMON_SRC_PATH, REACT_COMMON_DEST_PATH, { recursive: true });
  console.log(
    `synchronized: ${pathUtils.relative(process.cwd(), REACT_COMMON_DEST_PATH)}`
  );
}
