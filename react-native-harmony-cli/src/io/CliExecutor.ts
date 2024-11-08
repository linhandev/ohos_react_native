import { AbsolutePath } from '../core';
import { spawn } from 'node:child_process';

export interface CliOptions {
  argsFormat?: 'POSIX' | 'GNU';
  args?: Record<string, string | number | boolean>;
  cwd?: AbsolutePath;
  onArgsStringified?: (commandWidthArgs: string) => void;
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
}

export abstract class CliExecutor {
  abstract run(command: string, options?: CliOptions): Promise<string>;

  protected stringifyCliArgs(
    args: Record<string, string | number | boolean>,
    format: 'POSIX' | 'GNU' = 'POSIX'
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

        return `--${formattedKey}${format === 'POSIX' ? ' ' : '='}${value}`;
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

export class RealCliExecutor extends CliExecutor {
  async run(command: string, options?: CliOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      let commandWithArgs = command;
      if (options?.args) {
        commandWithArgs +=
          ' ' + this.stringifyCliArgs(options.args, options?.argsFormat);
      }
      options?.onArgsStringified?.(commandWithArgs);

      // Split command into program and arguments
      const [program, ...args] = commandWithArgs.split(' ');

      const process = spawn(program, args, {
        cwd: options?.cwd?.toString(),
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        options?.onStdout?.(output);
      });

      process.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        options?.onStderr?.(output);
      });

      process.on('error', (error) => {
        reject(error);
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(
            new Error(`Command failed with code ${code}\nStderr: ${stderr}`)
          );
        }
      });
    });
  }
}
