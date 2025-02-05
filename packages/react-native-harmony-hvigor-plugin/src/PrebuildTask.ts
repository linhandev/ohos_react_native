import pathUtils from 'node:path';
import { Logger } from './Logger';
import {
  CodegenConfig,
  FS,
  RNOHModulePluginError,
  RNOHModulePluginOptions,
  Subtask,
} from './types';
import { CommandExecutor } from './CommandExecutor';

type ConfigArgs = CodegenConfig;

type AutolinkingArgs = {
  harmonyProjectPath: string;
  nodeModulesPath: string;
  cmakeAutolinkPathRelativeToHarmony: string;
  cppRnohPackagesFactoryPathRelativeToHarmony: string;
  etsRnohPackagesFactoryPathRelativeToHarmony: string;
  ohPackagePathRelativeToHarmony: string;
  excludeNpmPackages: string | undefined;
  includeNpmPackages: string | undefined;
};

export class ValidationError extends RNOHModulePluginError {
  constructor(optionName: keyof RNOHModulePluginOptions, msg: string) {
    super(`ValidationError: ${optionName} — ${msg}`);
  }
}

export class PrebuildTask {
  constructor(
    private commandExecutor: CommandExecutor,
    private logger: Logger,
    private fs: FS
  ) {}

  run(options: RNOHModulePluginOptions) {
    try {
      const input = this.prepareInput(options);
      this.runSubtasks(input);
    } catch (err) {
      if (err instanceof RNOHModulePluginError) {
        this.logger.error(err.message);
        throw err;
      }
      throw err;
    }
  }

  private prepareInput(options: RNOHModulePluginOptions) {
    const nodeModulesPath =
      options.nodeModulesPath ??
      pathUtils.join(process.cwd(), '../node_modules');
    if (!this.fs.existsSync(nodeModulesPath)) {
      throw new ValidationError('nodeModulesPath', "path doesn't exist");
    }
    if (options.codegen !== null && !options.codegen?.rnohModulePath) {
      throw new ValidationError(
        'codegen',
        'rnohModulePath must be specified if codegen is not null'
      );
    }
    const DEVECO_SDK_HOME = process.env.DEVECO_SDK_HOME;
    if (!DEVECO_SDK_HOME) {
      throw new ValidationError(
        'metro',
        'DEVECO_SDK_HOME must be specified if metro configuration is not null.'
      );
    }
    return {
      nodeModulesPath,
      codegenArgs:
        options.codegen === null
          ? null
          : ({
              projectRootPath: '../',
              cppOutputPath: './entry/src/main/cpp/generated',
              ...(options.codegen ?? {}),
            } satisfies CodegenConfig),
      metro:
        options.metro === null
          ? null
          : { port: 8081, ...(options.metro ?? {}) },
      autolinkingArgs:
        options.autolinking === null
          ? null
          : ({
              harmonyProjectPath: './',
              nodeModulesPath: nodeModulesPath,
              cmakeAutolinkPathRelativeToHarmony:
                options.autolinking?.cmakeAutolinkPath ??
                './entry/src/main/cpp/autolinking.cmake',
              cppRnohPackagesFactoryPathRelativeToHarmony:
                options.autolinking?.cppRNOHPackagesFactoryPath ??
                './entry/src/main/cpp/RNOHPackagesFactory.h',
              etsRnohPackagesFactoryPathRelativeToHarmony:
                options.autolinking?.etsRNOHPackagesFactoryPath ??
                './entry/src/main/ets/RNOHPackagesFactory.ets',
              ohPackagePathRelativeToHarmony:
                options.autolinking?.ohPackagePath ?? './oh-package.json5',
              excludeNpmPackages: this.maybeWrapStringWithQuotes(
                options.autolinking?.excludeNpmPackages?.join(';') || undefined
              ),
              includeNpmPackages: this.maybeWrapStringWithQuotes(
                options.autolinking?.includeNpmPackages?.join(';') || undefined
              ),
            } satisfies AutolinkingArgs),
    };
  }

  private maybeWrapStringWithQuotes(str: string | undefined) {
    if (str === undefined || str === '') return undefined;
    return `"${str}"`;
  }

  private runSubtasks(input: {
    nodeModulesPath: string;
    metro: MetroPortForwardSubtaskInput;
    codegenArgs: CodegenConfig | null;
    autolinkingArgs: AutolinkingArgs | null;
  }) {
    (
      [
        new MetroPortForwardSubtask(
          this.commandExecutor,
          this.logger,
          input.metro
        ),
        new CodegenSubtask(
          this.commandExecutor,
          this.logger,
          input.nodeModulesPath,
          input.codegenArgs
        ),
        new AutolinkingSubtask(
          this.commandExecutor,
          this.logger,
          input.autolinkingArgs
        ),
      ] satisfies Subtask[]
    ).forEach((subtask) => subtask.run());
  }
}

type MetroPortForwardSubtaskInput = { port: any } | null;
class MetroPortForwardSubtask implements Subtask {
  constructor(
    private commandExecutor: CommandExecutor,
    private logger: Logger,
    private input: MetroPortForwardSubtaskInput
  ) {}

  run(): void {
    if (this.input === null) {
      this.logger.warn('[metro] skipped port forwarding');
      return;
    }
    const DEVECO_SDK_HOME = process.env.DEVECO_SDK_HOME;
    if (!DEVECO_SDK_HOME) {
      this.logger.error('DEVECO_SDK_HOME is undefined');
      return;
    }
    const result = this.commandExecutor.run(
      `${pathUtils.join(
        DEVECO_SDK_HOME,
        'default',
        'openharmony',
        'toolchains',
        'hdc'
      )} rport tcp:${this.input.port} tcp:${this.input.port}`
    );
    this.logger.info(`[metro] ${result}`);
  }
}

type CodegenSubtaskInput = ConfigArgs | null;

class CodegenSubtask implements Subtask {
  constructor(
    private commandExecutor: CommandExecutor,
    private logger: Logger,
    private nodeModulesPath: string,
    private input: CodegenSubtaskInput
  ) {}

  run(): void {
    if (this.input === null) {
      this.logger.warn('[codegen] skipped');
      return;
    }
    const result = this.commandExecutor.run(
      pathUtils.join(this.nodeModulesPath, '.bin', 'react-native') +
        ' codegen-harmony',
      this.input
    );
    this.logger.info(`[codegen]\n${result}`);
  }
}

type AutolinkingSubtaskInput = AutolinkingArgs | null;
class AutolinkingSubtask {
  constructor(
    private commandExecutor: CommandExecutor,
    private logger: Logger,
    private input: AutolinkingSubtaskInput
  ) {}

  run(): void {
    if (this.input === null) {
      this.logger.warn(`[autolink] skipped`);
      return;
    }
    const result = this.commandExecutor.run(
      pathUtils.join(this.input.nodeModulesPath, '.bin', 'react-native') +
        ' link-harmony',
      this.input
    );
    this.logger.info(`[autolink]\n${result}`);
  }
}
