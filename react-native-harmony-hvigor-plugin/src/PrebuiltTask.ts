import pathUtils from 'node:path';
import type { IFs } from 'memfs';

/**
 * @api
 */
type CodegenArgs = {
  rnohModulePath: string;
  cppOutputPath?: string;
  projectRootPath?: string;
  debug?: boolean;
  noSafetyCheck?: boolean;
};

/**
 * @api
 */
type Metro = {
  port?: number;
};

/**
 * @api
 */
export type RNOHHvigorPluginOptions = {
  nodeModulesPath?: string;
  metro?: Metro | null;
  codegen: CodegenArgs | null;
};

/**
 * @api
 */
export class RNOHHvigorPluginError extends Error {}

export class ValidationError extends RNOHHvigorPluginError {
  constructor(optionName: keyof RNOHHvigorPluginOptions, msg: string) {
    super(`ValidationError: ${optionName} — ${msg}`);
  }
}

export abstract class CliExecutor {
  abstract run(
    command: string,
    args?: Record<string, string | number | boolean>
  ): string;

  protected stringifyCliArgs(
    args: Record<string, string | number | boolean>
  ): string {
    return Object.entries(args)
      .filter(([_, value]) => {
        if (typeof value === 'boolean') {
          return value;
        }
        return value !== undefined && value !== null;
      })
      .map(([key, value]) => {
        const formattedKey = toKebabCase(key);

        if (typeof value === 'boolean') {
          return `--${formattedKey}`;
        }

        return `--${formattedKey} ${value}`;
      })
      .join(' ');
  }
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export interface Logger {
  info(message: string): void;

  warn(message: string): void;

  error(message: string): void;
}

type LogLevel = keyof Logger;

export class PrebuiltTask {
  constructor(
    private cliExecutor: CliExecutor,
    private logger: Logger,
    private fs: Pick<IFs, 'existsSync'>
  ) {}

  run(options: RNOHHvigorPluginOptions) {
    try {
      const config = this.prepareConfig(options);
      this.runSubtasks(({ type, message, level }) => {
        this.logger[level ?? 'info'](`[${type}] ${message}`);
      }, config);
    } catch (err) {
      if (err instanceof RNOHHvigorPluginError) {
        this.logger.error(err.message);
        throw err;
      }
      throw err;
    }
  }

  private prepareConfig(options: RNOHHvigorPluginOptions) {
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

    return {
      nodeModulesPath,
      codegenArgs:
        options.codegen === null
          ? null
          : ({
              projectRootPath: '../',
              cppOutputPath: './entry/src/main/cpp/generated',
              ...(options.codegen ?? {}),
            } satisfies CodegenArgs),
      metro:
        options.metro === null
          ? null
          : { port: 8081, ...(options.metro ?? {}) },
    };
  }

  private runSubtasks(
    onProgress: (arg: {
      type: 'metro' | 'codegen';
      message: string;
      level?: LogLevel;
    }) => void,
    config: {
      nodeModulesPath: string;
      metro: { port: number } | null;
      codegenArgs: CodegenArgs | null;
    }
  ) {
    if (config.metro === null) {
      onProgress({
        type: 'metro',
        message: 'skipped port forwarding',
        level: 'warn',
      });
    } else {
      onProgress({
        type: 'metro',
        message: this.cliExecutor.run(
          `hdc rport tcp:${config.metro.port} tcp:${config.metro.port}`
        ),
      });
    }
    if (config.codegenArgs === null) {
      onProgress({ type: 'codegen', message: 'skipped', level: 'warn' });
    } else {
      onProgress({
        type: 'codegen',
        message: this.cliExecutor.run(
          pathUtils.join(config.nodeModulesPath, '.bin', 'react-native') +
            ' codegen-harmony',
          config.codegenArgs
        ),
      });
    }
  }
}
