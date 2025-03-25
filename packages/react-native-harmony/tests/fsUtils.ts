import fs from 'fs';
import pathUtils from 'path';

export type FileStructure = { [key: string]: string | FileStructure };

export function copyMetroConfig(rootPath: string, filePath: string) {
  const localPath = pathUtils.join(rootPath, 'metro.config.js');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const testParentDir = pathUtils.dirname(__dirname);
  const absoluteColorsPath = pathUtils.join(
    testParentDir,
    '..',
    '..',
    'node_modules',
    'colors',
    'safe'
  );
  const colorsLine = "const colors = require('colors/safe');";
  const newColorsLine =
    `const colors = require("${absoluteColorsPath}");`.replaceAll("\\", "\\\\");
  const updatedFileContent = fileContent.replace(colorsLine, newColorsLine);

  fs.writeFileSync(localPath, updatedFileContent);

  return localPath;
}

export function createFileStructure(
  rootPath: string,
  fileStructure: FileStructure
) {
  for (const [name, content] of Object.entries(fileStructure)) {
    if (typeof content === 'string') {
      fs.writeFileSync(pathUtils.join(rootPath, name), content);
    } else {
      fs.mkdirSync(pathUtils.join(rootPath, name));
      createFileStructure(pathUtils.join(rootPath, name), content);
    }
  }
}
