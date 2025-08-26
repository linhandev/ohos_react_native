/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import pathUtils from 'node:path';
import { execSync } from 'child_process';
import readline from 'node:readline/promises';

const REPO_ROOT_PATH = pathUtils.resolve(__dirname, '..');

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

(async () => {
  try {
    applyPatch();
    stageReactNativeChanges();
    await pressToContinue(
      `You can now modify "${pathUtils.relative(REPO_ROOT_PATH, REACT_NATIVE_SUBMODULE_PATH)}". Press any key to continue...`
    );
    stageReactNativeChanges();
    regeneratePatch();
  } finally {
    cleanReactNativeSubmodule();
  }
})();

function applyPatch() {
  cleanReactNativeSubmodule();
  execSync(`git apply --whitespace=fix ${REACT_NATIVE_PATCH_PATH}`, {
    cwd: REACT_NATIVE_SUBMODULE_PATH,
  });
  console.log(
    `applied ${pathUtils.relative(REPO_ROOT_PATH, REACT_NATIVE_PATCH_PATH)} to ${pathUtils.relative(REPO_ROOT_PATH, REACT_NATIVE_SUBMODULE_PATH)}`
  );
}

function stageReactNativeChanges() {
  execSync(`git add .`, {
    cwd: REACT_NATIVE_SUBMODULE_PATH,
  });
  console.log(
    `staged changes in ${pathUtils.relative(REPO_ROOT_PATH, REACT_NATIVE_SUBMODULE_PATH)}`
  );
}

async function pressToContinue(message: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  await rl.question(message);
  rl.close();
}

function regeneratePatch() {
  execSync(`git diff --full-index HEAD > ${REACT_NATIVE_PATCH_PATH}`, {
    cwd: REACT_NATIVE_SUBMODULE_PATH,
  });
  console.log(
    `regenerated ${pathUtils.relative(REPO_ROOT_PATH, REACT_NATIVE_PATCH_PATH)}`
  );
}

function cleanReactNativeSubmodule() {
  execSync('git reset --hard HEAD && git clean -dfx', {
    cwd: REACT_NATIVE_SUBMODULE_PATH,
  });
  console.log(
    `cleaned ${pathUtils.relative(REPO_ROOT_PATH, REACT_NATIVE_SUBMODULE_PATH)}`
  );
}
