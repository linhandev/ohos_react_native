import { PrebuildTask, ValidationError } from '../src/PrebuildTask';
import { memfs, NestedDirectoryJSON } from 'memfs';
import pathUtils from 'node:path';
import { StubCommandExecutor, FakeLogger } from './__fixtures__';

function createPreBuildTask(options: {
  onCodegenRun?: (command: string) => string;
  fsSetup?: NestedDirectoryJSON;
}) {
  const fakeCliExecutor = new StubCommandExecutor(
    options.onCodegenRun ?? (() => '')
  );
  const fakeLogger = new FakeLogger();

  const preBuildTask = new PrebuildTask(
    fakeCliExecutor,
    fakeLogger,
    memfs(options.fsSetup, './').fs
  );
  return { preBuildTask, fakeCliExecutor, fakeLogger };
}

it('should handle port forwarding, call codegen-harmony, and log progress', () => {
  const { preBuildTask, fakeCliExecutor, fakeLogger } = createPreBuildTask({
    onCodegenRun: () => '__GENERATED_FILE__',
    fsSetup: {
      node_modules: {
        '.bin': {
          'react-native': '',
        },
      },
    },
  });

  preBuildTask.run({
    nodeModulesPath: './node_modules',
    codegen: { rnohModulePath: '_' },
  });

  const executedCommands = fakeCliExecutor.getCommands();
  expect(executedCommands[0]).toContain('hdc rport tcp:8081 tcp:8081');
  expect(executedCommands[1]).toBe(
    pathUtils.join('node_modules', '.bin', 'react-native') +
      ' codegen-harmony --project-root-path ../ --cpp-output-path ./entry/src/main/cpp/generated --rnoh-module-path _'
  );
  expect(
    fakeLogger
      .getLogs()
      .map((log) => log.msg)
      .includes('[codegen]\n__GENERATED_FILE__')
  ).toBeTruthy();
});

it("should fail if node_modules dir doesn't exist", () => {
  const { preBuildTask } = createPreBuildTask({});

  expect(() => {
    preBuildTask.run({
      nodeModulesPath: './NOT_EXISTING_DIR',
      codegen: { rnohModulePath: '_' },
    });
  }).toThrow(ValidationError);
});

it('should allow skipping codegen process', () => {
  const { preBuildTask, fakeCliExecutor, fakeLogger } = createPreBuildTask({
    fsSetup: {
      node_modules: {
        '.bin': {
          'react-native': '',
        },
      },
    },
  });

  preBuildTask.run({
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
  const { preBuildTask, fakeCliExecutor, fakeLogger } = createPreBuildTask({
    fsSetup: {
      node_modules: {
        '.bin': {
          'react-native': '',
        },
      },
    },
  });

  preBuildTask.run({
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

it('should call autolinking', () => {
  const { preBuildTask, fakeCliExecutor } = createPreBuildTask({
    fsSetup: {
      node_modules: {
        '.bin': {
          'react-native': '',
        },
      },
    },
  });

  preBuildTask.run({
    nodeModulesPath: './node_modules',
    codegen: null,
    metro: null,
  });

  expect(
    fakeCliExecutor
      .getCommands()
      .some((command) => command.includes('link-harmony'))
  ).toBeTruthy();
});

it('should skip autolinking', () => {
  const { preBuildTask, fakeCliExecutor } = createPreBuildTask({
    fsSetup: {
      node_modules: {
        '.bin': {
          'react-native': '',
        },
      },
    },
  });

  preBuildTask.run({
    nodeModulesPath: './node_modules',
    codegen: null,
    metro: null,
    autolinking: null,
  });

  expect(
    fakeCliExecutor
      .getCommands()
      .every((command) => !command.includes('link-harmony'))
  ).toBeTruthy();
});
