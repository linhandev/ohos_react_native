import { AbsolutePath } from '../src/core';
import { RealFS } from '../src/io';
import { buildDirTree, createFileStructure } from './fsUtils';
import { ReactNativeFixture } from './ReactNativeFixture';
import tmp from 'tmp';

let tmpDir: AbsolutePath;

beforeEach(async () => {
  const dir = tmp.dirSync();
  tmpDir = new AbsolutePath(dir.name);
});

afterEach(() => {
  if (expect.getState().assertionCalls != expect.getState().numPassingAsserts) {
    console.log(buildDirTree(tmpDir.getValue()));
  }
});

it('list init-harmony in the help description', async () => {
  const result = new ReactNativeFixture('.').help();

  expect(result.includes('init-harmony')).toBeTruthy();
});

it('should add harmony boilerplate to existing project', async () => {
  const fs = new RealFS();
  createFileStructure(tmpDir.toString(), {
    '.git': {},
    'package.json': `{
      "name": "my-project-name"
    }`,
    node_modules: {
      '@react-native-oh': {
        'react-native-harmony': {
          harmony: { 'rnoh-hvigor-plugin-0.0.0.tgz': '...' },
        },
      },
    },
    'metro.config.js': '...',
  });

  new ReactNativeFixture(tmpDir).initHarmony({
    projectRootPath: '.',
    bundleName: 'com.org.project',
  });

  const allFilesInProject = fs
    .readDirentsSync(tmpDir, { recursive: true })
    .flatMap((dirent) =>
      dirent.isDirectory() ? [] : [dirent.path.relativeTo(tmpDir).toString()]
    );
  const filesCountInHarmonyDir = fs
    .readDirentsSync(tmpDir.copyWithNewSegment('harmony'), { recursive: true })
    .flatMap((dirent) => !dirent.isDirectory()).length;
  expect(filesCountInHarmonyDir).toEqual(54);
  expect(allFilesInProject).toEqual(
    expect.arrayContaining([
      'metro.config.js',
      'package.json',
      'harmony/.gitignore',
      'harmony/build-profile.json5',
      'harmony/codelinter.json',
      'harmony/hvigorfile.ts',
      'harmony/oh-package.json5',
      'harmony/AppScope/app.json5',
      'harmony/entry/.gitignore',
      'harmony/entry/build-profile.json5',
      'harmony/entry/hvigorfile.ts',
      'harmony/entry/oh-package.json5',
      'harmony/hvigor/hvigor-config.json5',
      'harmony/entry/src/main/module.json5',
      'harmony/entry/src/ohosTest/module.json5',
      'harmony/AppScope/resources/base/element/string.json',
      'harmony/AppScope/resources/base/media/app_icon.png',
      'harmony/entry/src/main/cpp/.gitignore',
      'harmony/entry/src/main/cpp/CMakeLists.txt',
      'harmony/entry/src/main/cpp/PackageProvider.cpp',
      'harmony/entry/src/main/ets/.gitignore',
      'harmony/entry/src/main/ets/PackageProvider.ets',
      'harmony/entry/src/main/resources/.gitignore',
      'harmony/entry/src/main/ets/codegen/.gitignore',
      'harmony/entry/src/main/ets/entryability/EntryAbility.ets',
      'harmony/entry/src/main/ets/pages/.gitkeep',
      'harmony/entry/src/main/ets/pages/Index.ets',
      'harmony/entry/src/main/ets/workers/RNOHWorker.ets',
      'harmony/entry/src/ohosTest/ets/test/List.test.ets',
      'harmony/entry/src/main/resources/base/element/color.json',
      'harmony/entry/src/main/resources/base/element/string.json',
      'harmony/entry/src/main/resources/base/media/icon.png',
      'harmony/entry/src/main/resources/base/profile/main_pages.json',
    ])
  );
  expect(
    await fs.readText(tmpDir.copyWithNewSegment('metro.config.js'))
  ).toContain('createHarmonyMetroConfig');
  expect(
    await fs.readText(
      tmpDir.copyWithNewSegment('harmony', 'hvigor', 'hvigor-config.json5')
    )
  ).toContain('rnoh-hvigor-plugin-0.0.0.tgz');
});

it("should fail if react-native-harmony isn't installed", () => {
  createFileStructure(tmpDir.toString(), {});

  const result = new ReactNativeFixture(tmpDir).initHarmony({
    projectRootPath: '.',
    bundleName: 'com.org.project',
  }).stderr;

  expect(result).toContain('react-native-harmony does not exist');
});

it('should fail if harmony dir exists', () => {
  createFileStructure(tmpDir.toString(), {
    harmony: {},
    node_modules: {
      '@react-native-oh': {
        'react-native-harmony': {
          harmony: { 'rnoh-hvigor-plugin-0.0.0.tgz': '...' },
        },
      },
    },
  });

  const result = new ReactNativeFixture(tmpDir).initHarmony({
    projectRootPath: '.',
    bundleName: 'com.org.project',
  }).stderr;

  expect(result).toContain('The "harmony" directory is already initialized');
});

it('should let the user know metro.config.js has been modified', () => {
  createFileStructure(tmpDir.toString(), {
    '.git': {},
    'metro.config.js': '...',
    'package.json': '{ "name": "foobar" }',
    node_modules: {
      '@react-native-oh': {
        'react-native-harmony': {
          harmony: { 'rnoh-hvigor-plugin-0.0.0.tgz': '...' },
        },
      },
    },
  });

  const result = new ReactNativeFixture(tmpDir).initHarmony({
    projectRootPath: '.',
    bundleName: 'com.org.project',
  }).stderr;

  expect(result).toContain('Overwritten "./metro.config.js"');
});

it('should let the user know a new directory is created', () => {
  createFileStructure(tmpDir.toString(), {
    'package.json': '{ "name": "foobar" }',
    node_modules: {
      '@react-native-oh': {
        'react-native-harmony': {
          harmony: { 'rnoh-hvigor-plugin-0.0.0.tgz': '...' },
        },
      },
    },
  });

  const result = new ReactNativeFixture(tmpDir).initHarmony({
    projectRootPath: '.',
    bundleName: 'com.org.project',
  }).stdout;

  expect(result).toContain('Created "./harmony"');
});

it("should print metro.config.js to the console instead of overwriting this file if user doesn't use git", () => {
  createFileStructure(tmpDir.toString(), {
    'metro.config.js': '...',
    'package.json': '{ "name": "foobar" }',
    node_modules: {
      '@react-native-oh': {
        'react-native-harmony': {
          harmony: { 'rnoh-hvigor-plugin-0.0.0.tgz': '...' },
        },
      },
    },
  });

  const result = new ReactNativeFixture(tmpDir).initHarmony({
    projectRootPath: '.',
    bundleName: 'com.org.project',
  }).stdout;

  expect(result).toContain('createHarmonyMetroConfig');
});

describe('app bundle name', () => {
  it('should use provided bundle name', () => {
    const fs = new RealFS();
    createFileStructure(tmpDir.toString(), {
      'metro.config.js': '...',
      'package.json': '{ "name": "foobar" }',
      node_modules: {
        '@react-native-oh': {
          'react-native-harmony': {
            harmony: { 'rnoh-hvigor-plugin-0.0.0.tgz': '...' },
          },
        },
      },
    });

    new ReactNativeFixture(tmpDir).initHarmony({
      projectRootPath: '.',
      bundleName: 'com.org.project',
      appName: 'native-project-name',
    }).stdout;
    const appJson5 = fs.readTextSync(
      tmpDir.copyWithNewSegment('harmony', 'AppScope', 'app.json5')
    );
    expect(appJson5).toContain(`"bundleName": "com.org.project"`);
  });

  it('should fail if bundle name is invalid', () => {
    const fs = new RealFS();
    createFileStructure(tmpDir.toString(), {
      'metro.config.js': '...',
      'package.json': '{ "name": "foobar" }',
      node_modules: {
        '@react-native-oh': {
          'react-native-harmony': {
            harmony: { 'rnoh-hvigor-plugin-0.0.0.tgz': '...' },
          },
        },
      },
    });

    const result = new ReactNativeFixture(tmpDir).initHarmony({
      projectRootPath: '.',
      bundleName: '@-invalid-name',
    }).stderr;

    expect(result).toContain('Bundle name validation failed');
  });
});

describe('custom RNOH package name', () => {
  it('should import from provided RNOH NPM package name', () => {
    const fs = new RealFS();
    createFileStructure(tmpDir.toString(), {
      '.git': {},
      'metro.config.js': '...',
      'package.json': '{ "name": "foobar" }',
      node_modules: {
        '@rnoh': {
          'blazingly-fast-react-native-harmony': {
            harmony: { 'rnoh-hvigor-plugin-0.0.0.tgz': '...' },
          },
        },
      },
    });

    new ReactNativeFixture(tmpDir).initHarmony({
      projectRootPath: '.',
      bundleName: 'com.org.project',
      rnohNpmPackageName: '@rnoh/blazingly-fast-react-native-harmony',
    }).stderr;

    [
      tmpDir.copyWithNewSegment('metro.config.js'),
      tmpDir.copyWithNewSegment('harmony', 'oh-package.json5'),
      tmpDir.copyWithNewSegment('harmony', 'hvigor', 'hvigor-config.json5'),
    ].forEach((path) => {
      expect(fs.readTextSync(path)).toContain(
        '@rnoh/blazingly-fast-react-native-harmony'
      );
    });
  });
});

describe('follow up instructions', () => {
  it('should print instructions how to run project on a physical device', () => {
    const fs = new RealFS();
    createFileStructure(tmpDir.toString(), {
      '.git': {},
      'metro.config.js': '...',
      'package.json': '{ "name": "foobar" }',
      node_modules: {
        '@rnoh': {
          'blazingly-fast-react-native-harmony': {
            harmony: { 'rnoh-hvigor-plugin-0.0.0.tgz': '...' },
          },
        },
      },
    });

    const stdout = new ReactNativeFixture(tmpDir).initHarmony({
      projectRootPath: '.',
      bundleName: 'com.org.project',
      rnohNpmPackageName: '@rnoh/blazingly-fast-react-native-harmony',
    }).stdout;

    expect(stdout).toContain('Run on a physical device');
  });
});
