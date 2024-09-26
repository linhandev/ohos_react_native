import {
  PrebuiltTask,
  CliExecutor,
  Logger,
  ValidationError,
} from '../src/PrebuiltTask';
import { memfs, NestedDirectoryJSON } from 'memfs';
import pathUtils from 'node:path';
class FakeCliExecutor extends CliExecutor {
  private commands: string[] = [];

  constructor(private onRun: (command: string) => string) {
    super();
  }

  run(
    command: string,
    args?: Record<string, string | number | boolean>
  ): string {
    let commandWithArgs = command;
    if (args) {
      commandWithArgs += ' ' + this.stringifyCliArgs(args);
    }
    this.commands.push(commandWithArgs);
    return this.onRun(commandWithArgs);
  }

  getCommands() {
    return this.commands;
  }
}

class FakeLogger implements Logger {
  private logs: { type: 'info' | 'warn' | 'error'; msg: string }[] = [];

  info(message: string) {
    this.logs.push({ type: 'info', msg: message });
  }

  warn(message: string): void {
    this.logs.push({ type: 'warn', msg: message });
  }

  error(message: string): void {
    this.logs.push({ type: 'error', msg: message });
  }

  getLogs() {
    return this.logs;
  }
}

function createPreBuiltTask(options: {
  onCodegenRun?: (command: string) => string;
  fsSetup?: NestedDirectoryJSON;
}) {
  const fakeCliExecutor = new FakeCliExecutor(
    options.onCodegenRun ?? (() => '')
  );
  const fakeLogger = new FakeLogger();

  const preBuiltTask = new PrebuiltTask(
    fakeCliExecutor,
    fakeLogger,
    memfs(options.fsSetup, './').fs
  );
  return { preBuiltTask, fakeCliExecutor, fakeLogger };
}

it('should handle port forwarding, call codegen-harmony, and log progress', () => {
  const { preBuiltTask, fakeCliExecutor, fakeLogger } = createPreBuiltTask({
    onCodegenRun: () => '__GENERATED_FILE__',
    fsSetup: {
      node_modules: {
        '.bin': {
          'react-native': '',
        },
      },
    },
  });

  preBuiltTask.run({
    nodeModulesPath: './node_modules',
    codegen: { rnohModulePath: '_' },
  });

  const executedCommands = fakeCliExecutor.getCommands();
  expect(executedCommands[0]).toBe('hdc rport tcp:8081 tcp:8081');
  expect(executedCommands[1]).toBe(
    pathUtils.join('node_modules', '.bin', 'react-native') +
      ' codegen-harmony --project-root-path ../ --cpp-output-path ./entry/src/main/cpp/generated --rnoh-module-path _'
  );
  expect(
    fakeLogger
      .getLogs()
      .map((log) => log.msg)
      .includes('[codegen] __GENERATED_FILE__')
  ).toBeTruthy();
});

it("should fail if node_modules dir doesn't exist", () => {
  const { preBuiltTask } = createPreBuiltTask({});

  expect(() => {
    preBuiltTask.run({
      nodeModulesPath: './NOT_EXISTING_DIR',
      codegen: { rnohModulePath: '_' },
    });
  }).toThrow(ValidationError);
});

it('should allow skipping codegen process', () => {
  const { preBuiltTask, fakeCliExecutor, fakeLogger } = createPreBuiltTask({
    fsSetup: {
      node_modules: {
        '.bin': {
          'react-native': '',
        },
      },
    },
  });

  preBuiltTask.run({
    nodeModulesPath: './node_modules',
    codegen: null,
  });

  expect(
    fakeCliExecutor
      .getCommands()
      .some((command) => command.includes('codegen-harmony'))
  ).toBeFalsy();
  expect(
    fakeLogger.getLogs().some((log) => log.msg.includes('[codegen] skipped'))
  ).toBeTruthy();
});

it('should allow skipping Metro setup', () => {
  const { preBuiltTask, fakeCliExecutor, fakeLogger } = createPreBuiltTask({
    fsSetup: {
      node_modules: {
        '.bin': {
          'react-native': '',
        },
      },
    },
  });

  preBuiltTask.run({
    nodeModulesPath: './node_modules',
    metro: null,
    codegen: null,
  });

  expect(
    fakeCliExecutor.getCommands().some((command) => command.includes('rport'))
  ).toBeFalsy();
  expect(
    fakeLogger.getLogs().some((log) => log.msg.includes('[metro] skipped'))
  ).toBeTruthy();
});
