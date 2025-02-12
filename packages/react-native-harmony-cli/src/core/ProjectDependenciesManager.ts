import { AbsolutePath } from './AbsolutePath';
import { PackageJSON } from './PackageJSON';
import { FS } from '../core';

export class ProjectDependency {
  constructor(
    private fs: FS,
    private packageRootPath: AbsolutePath,
    private projectRootPath: AbsolutePath
  ) {}

  getRootPath() {
    return this.packageRootPath;
  }

  getCodegenConfigs() {
    return this.readPackageJSON().getCodegenConfigs();
  }

  getHarFilePath(): AbsolutePath | null {
    const packageHarmonyPath =
      this.packageRootPath.copyWithNewSegment('harmony');
    if (!this.fs.existsSync(packageHarmonyPath)) {
      return null;
    }

    const harFilePaths = this.fs.findFilePathsWithExtensions(
      packageHarmonyPath,
      ['har']
    );
    if (harFilePaths.length !== 1) {
      return null;
    }
    return harFilePaths[0];
  }

  readPackageJSON() {
    return PackageJSON.fromProjectRootPath(
      this.fs,
      this.packageRootPath,
      this.projectRootPath
    );
  }
}

export class ProjectDependenciesManager {
  constructor(private fs: FS, private projectRootPath: AbsolutePath) {}

  async forEachAsync(
    cb: (dependency: ProjectDependency) => Promise<void> | void
  ) {
    await this.forEachDependencyInDirectory(
      cb,
      this.projectRootPath.copyWithNewSegment('node_modules')
    );
  }

  private async forEachDependencyInDirectory(
    cb: (dependency: ProjectDependency) => Promise<void> | void,
    directoryPath: AbsolutePath
  ) {
    if (!this.fs.existsSync(directoryPath)) {
      return;
    }
    for (let dirent of this.fs.readDirentsSync(directoryPath)) {
      if (dirent.isDirectory() || dirent.isSymbolicLink()) {
        if (dirent.name.startsWith('.')) {
          continue;
        } else if (dirent.name.startsWith('@')) {
          await this.forEachDependencyInDirectory(
            cb,
            directoryPath.copyWithNewSegment(dirent.name)
          );
        } else {
          const potentialDependencyRootPath = directoryPath.copyWithNewSegment(
            dirent.name
          );
          if (
            !this.fs.existsSync(
              potentialDependencyRootPath.copyWithNewSegment('package.json')
            )
          ) {
            continue;
          }
          await cb(
            new ProjectDependency(
              this.fs,
              potentialDependencyRootPath,
              this.projectRootPath
            )
          );
        }
      }
    }
  }
}
