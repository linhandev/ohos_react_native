import pathUtils from 'node:path';
import { AbsolutePath } from '../core';
import { IFs } from 'memfs';
import MemDirent from 'memfs/lib/Dirent';
import nodeFS from 'node:fs';
import { Dirent } from 'node:fs';

export function findFilePathsWithExtensions(
  dirPath: AbsolutePath,
  fileExtensions: readonly string[],
  options: { fs?: IFs | typeof nodeFS } = {}
): AbsolutePath[] {
  const fs = (options?.fs ?? nodeFS) as typeof nodeFS;
  let results: AbsolutePath[] = [];
  const files = fs.readdirSync(dirPath.getValue(), { withFileTypes: true });
  for (const file of files) {
    if (
      !(file instanceof Dirent) &&
      !((file as MemDirent) instanceof MemDirent)
    ) {
      continue;
    }
    const path = dirPath.copyWithNewSegment(file.name.toString());
    if (fs.lstatSync(path.toString()).isDirectory()) {
      results = results.concat(
        findFilePathsWithExtensions(path, fileExtensions, options)
      );
    } else if (
      fileExtensions.includes(
        pathUtils.extname(file.name.toString()).substring(1)
      )
    ) {
      results.push(path);
    }
  }
  return results;
}
