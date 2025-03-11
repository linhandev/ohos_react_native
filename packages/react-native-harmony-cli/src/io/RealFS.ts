import { AbsolutePath } from '../core';
import { Dirent, FS } from '../core/FileSystem';
import fs, { Dirent as NodeFSDirent } from 'node:fs';

class RealFSDirent extends Dirent {
  constructor(private nodeFSDirent: NodeFSDirent) {
    super();
  }

  isDirectory(): boolean {
    return this.nodeFSDirent.isDirectory();
  }

  isSymbolicLink(): boolean {
    return this.nodeFSDirent.isSymbolicLink();
  }

  get name(): string {
    return this.nodeFSDirent.name;
  }

  get path(): AbsolutePath {
    return new AbsolutePath(this.nodeFSDirent.path).copyWithNewSegment(
      this.nodeFSDirent.name
    );
  }
}

export class RealFS extends FS {
  existsSync(path: AbsolutePath): boolean {
    return fs.existsSync(path.toString());
  }

  readTextSync(path: AbsolutePath): string {
    return fs.readFileSync(path.toString()).toString();
  }

  async readText(path: AbsolutePath): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(path.toString(), undefined, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data.toString());
      });
    });
  }

  writeTextSync(path: AbsolutePath, data: string): void {
    fs.writeFileSync(path.toString(), data);
  }

  readDirentsSync(
    path: AbsolutePath,
    options?: { recursive?: boolean | undefined } | undefined
  ): Dirent[] {
    return fs
      .readdirSync(path.toString(), {
        withFileTypes: true,
        recursive: options?.recursive,
      })
      .map((rawDirent) => new RealFSDirent(rawDirent));
  }

  renameSync(oldPath: AbsolutePath, newPath: AbsolutePath) {
    fs.renameSync(oldPath.toString(), newPath.toString());
  }
}
