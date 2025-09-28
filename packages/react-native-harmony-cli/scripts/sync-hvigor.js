/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const fs = require('fs').promises;

async function sync(configFilePaths = []) {
  const dir = './harmony';
  const files = await fs.readdir(dir);
  const file = files.find(f => /^rnoh-hvigor-plugin-\d+(\.\d+){2}\.tgz$/.test(f));
  if (!file) {
    return;
  }
  configFilePaths.forEach(async (configFilePath) => {
    const fileContent = await fs.readFile(configFilePath, 'utf8');
    const updatedContent = fileContent.replace(/rnoh-hvigor-plugin-\d+(\.\d+){2}\.tgz/g, file);
    fs.writeFile(configFilePath, updatedContent, 'utf8');
  });
}

sync([
  '../tester/harmony/hvigor/hvigor-config.json5',
  '../tester-ecosystem/harmony/hvigor/hvigor-config.json5',
  '../react-native-harmony-61-interop-tester/rnoh-entry/harmony/hvigor/hvigor-config.json5'
]).catch(console.error);
