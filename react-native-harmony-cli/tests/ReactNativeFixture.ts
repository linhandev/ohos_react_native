import { execaCommandSync } from 'execa';
import pathUtils from 'path';
export class ReactNativeFixture {
  constructor(private cwd: string) {}

  packHarmony(args: {
    harmonyDirPath: string;
    ohModulePath: string;
    packageJSONPath: string;
  }) {
    return execaCommandSync(
      `react-native pack-harmony --harmony-dir-path ${this.useCwd(
        args.harmonyDirPath
      )} --oh-module-path ${this.useCwd(
        args.ohModulePath
      )} --package-json-path ${this.useCwd(args.packageJSONPath)}`
    ).stdout;
  }
  unpackHarmony(args: { nodeModulesPath: string; outputDir: string }) {
    return execaCommandSync(
      `react-native unpack-harmony --node-modules-path ${this.useCwd(
        args.nodeModulesPath
      )} --output-dir ${this.useCwd(args.outputDir)}`
    ).stdout;
  }

  createMetroHostConstantsHarmony(args: { output: string }) {
    return execaCommandSync(
      `react-native create-metro-host-constants-harmony --output ${this.useCwd(
        args.output
      )}`
    ).stdout;
  }

  codegenHarmony(args: {
    cppOutputPath: string;
    projectRootPath: string;
    rnohModulePath?: string;
  }) {
    return execaCommandSync(
      `react-native codegen-harmony --cpp-output-path ${this.useCwd(
        args.cppOutputPath
      )} --project-root-path ${this.useCwd(
        args.projectRootPath
      )} --rnoh-module-path ${this.useCwd(
        args.rnohModulePath ?? './harmony/rnoh'
      )}
      `
    ).stdout;
  }

  private useCwd(relPath: string) {
    return pathUtils.join(this.cwd, relPath);
  }
}
