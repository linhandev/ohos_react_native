import * as tmp from 'tmp';
import { copyMetroConfig, createFileStructure } from './fsUtils';
import * as pathUtils from 'path';
import fs from 'node:fs';

let tmpDir = '';
let removeTmpDir = () => {};
let originalCwd = process.cwd();
let metroConfigPath = '';

beforeEach(async () => {
  const dir = tmp.dirSync();
  tmpDir = dir.name;
  removeTmpDir = dir.removeCallback;
  process.chdir(originalCwd);
});

afterEach(removeTmpDir);

function resolveRequest({
  originModulePath,
  moduleName,
  platform,
  rnProjectRootPath,
  nodeModulesPaths,
}: {
  originModulePath: string;
  moduleName: string;
  platform: string;
  nodeModulesPaths?: string[];
  rnProjectRootPath?: string;
}) {
  const rnProjectRootPath_ = rnProjectRootPath ?? tmpDir;
  metroConfigPath = copyMetroConfig(rnProjectRootPath_, 'metro.config.js');
  process.chdir(rnProjectRootPath_);
  const { createHarmonyMetroConfig } = require(metroConfigPath);
  const resolutionContext = {
    resolveRequest: (context: any, moduleName: string, platform: string) => {
      return { moduleName: moduleName, platform: platform };
    },
    originModulePath,
    nodeModulesPaths,
  };
  const resolveRequest_ = createHarmonyMetroConfig({
    reactNativeHarmonyPackageName: 'react-native-harmony',
  })?.resolver?.resolveRequest;
  return resolveRequest_(resolutionContext, moduleName, platform);
}

it('should redirect internal imports in harmony packages', async () => {
  createFileStructure(tmpDir, {
    node_modules: {
      'react-native-harmony-foo': {
        'package.json': `{
          "name": "react-native-harmony-foo",
          "harmony": {
            "alias": "react-native-foo",
            "redirectInternalImports": true
          }}`,
      },
    },
  });

  const resolution = resolveRequest({
    originModulePath: pathUtils.join(
      tmpDir,
      'node_modules',
      'react-native-foo',
      'src',
      'foo.ts'
    ),
    moduleName: './bar.ts',
    platform: 'harmony',
  });

  expect(resolution.moduleName).toEqual(
    pathUtils.posix.join('react-native-harmony-foo', 'src', 'bar.ts')
  );
});

it('should redirect internal imports in scoped harmony packages', async () => {
  createFileStructure(tmpDir, {
    node_modules: {
      '@rnoh': {
        'react-native-foo': {
          'package.json': `{
          "name": "@rnoh/react-native-harmony-foo",
          "harmony": {
            "alias": "react-native-foo",
            "redirectInternalImports": true
          }}`,
        },
      },
    },
  });

  const resolution = resolveRequest({
    originModulePath: pathUtils.join(
      tmpDir,
      'node_modules',
      'react-native-foo',
      'src',
      'foo.ts'
    ),
    moduleName: './bar.ts',
    platform: 'harmony',
  });

  expect(resolution.moduleName).toEqual(
    pathUtils.posix.join('@rnoh/react-native-foo', 'src', 'bar.ts')
  );
});

it('should redirect internal imports if alias is scoped', async () => {
  createFileStructure(tmpDir, {
    node_modules: {
      '@rnoh': {
        'react-native-harmony-foo': {
          'package.json': `{
          "name": "@rnoh/react-native-harmony-foo",
          "harmony": {
            "alias": "@org/react-native-foo",
            "redirectInternalImports": true
          }}`,
        },
      },
    },
  });

  const resolution = resolveRequest({
    originModulePath: pathUtils.join(
      tmpDir,
      'node_modules',
      '@org',
      'react-native-foo',
      'src',
      'foo.ts'
    ),
    moduleName: './bar.ts',
    platform: 'harmony',
  });

  expect(resolution.moduleName).toEqual(
    pathUtils.posix.join('@rnoh', 'react-native-harmony-foo', 'src', 'bar.ts')
  );
});

it('should not redirect internal imports when flag not set', async () => {
  createFileStructure(tmpDir, {
    node_modules: {
      'react-native-harmony-foo': {
        'package.json': `{
          "name": "react-native-harmony-foo",
          "harmony": {
            "alias": "react-native-foo"
          }}`,
      },
    },
  });

  const resolution = resolveRequest({
    originModulePath: pathUtils.join(
      tmpDir,
      'node_modules',
      'react-native-foo',
      'src',
      'foo.ts'
    ),
    moduleName: './bar.ts',
    platform: 'harmony',
  });

  expect(resolution.moduleName).toEqual('./bar.ts');
});

describe('monorepos', () => {
  it('should redirect import when project imports library', async () => {
    createFileStructure(tmpDir, {
      packages: {
        'my-project': {},
      },
      node_modules: {
        'react-native-harmony-foo': {
          'package.json': `{
            "name": "react-native-harmony-foo",
            "harmony": {
              "alias": "react-native-foo"
            }}`,
        },
      },
    });

    const resolution = resolveRequest({
      originModulePath: pathUtils.join(
        tmpDir,
        'packages',
        'my-project',
        'index.ts'
      ),
      moduleName: 'react-native-foo',
      platform: 'harmony',
      rnProjectRootPath: pathUtils.join(tmpDir, 'packages', 'my-project'),
      nodeModulesPaths: ['../../node_modules'],
    });

    expect(resolution.moduleName).toEqual('react-native-harmony-foo');
  });

  it('should redirect import when harmony library overrides internals of another library', async () => {
    createFileStructure(tmpDir, {
      packages: {
        'my-project': {},
      },
      node_modules: {
        'react-native-harmony-foo': {
          'package.json': `{
            "name": "react-native-harmony-foo",
            "harmony": {
              "alias": "react-native-foo",
              "redirectInternalImports": true
            }}`,
        },
      },
    });

    const resolution = resolveRequest({
      originModulePath: pathUtils.join(
        tmpDir,
        'node_modules',
        'react-native-foo',
        'src',
        'foo.ts'
      ),
      moduleName: './bar.ts',
      platform: 'harmony',
      rnProjectRootPath: pathUtils.join(tmpDir, 'packages', 'my-project'),
      nodeModulesPaths: ['../../node_modules'],
    });

    expect(resolution.moduleName).toEqual(
      pathUtils.posix.join('react-native-harmony-foo', 'src', 'bar.ts')
    );
  });
});
