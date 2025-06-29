import { Command } from './types';
import { Logger, RealFS } from '../io';
import {
  MetroConfigTemplate,
  EntryStringVarTemplate,
  EntryIndexTemplate,
  OhPackageJson5Template,
  HvigorConfigJson5Template,
} from '../init/templates';
import { AbsolutePath, DescriptiveError, PackageJSON } from '../core';
import { copy as dirCopy, ensureDir } from 'fs-extra';
import { AppScopeStringVarTemplate } from '../init/templates/AppScopeStringVarTemplate';
import { AppScopeAppJSON5Template } from '../init/templates/AppScopeAppJSON5Template';

const COMMAND_NAME = 'init-harmony';
const BUNDLE_NAME_PATTERN = /^[a-zA-Z][0-9a-zA-Z_.]+$/;

export const commandInitHarmony: Command = {
  name: COMMAND_NAME,
  description: 'Initializes a new RNOH project.',
  options: [
    {
      name: '--bundle-name <string>',
      description: `Required. The native app bundle name. It must match ${BUNDLE_NAME_PATTERN} pattern and include three segments separated by a dot (.).`,
    },
    {
      name: '--project-root-path [path]',
      description: 'Relative path to the project root',
      default: '.',
    },
    {
      name: '--app-name [string]',
      description:
        'The native app name. Defaults to the name property in package.json',
      default: undefined,
    },
    {
      name: '--rnoh-npm-package-name [string]',
      description: 'Name of the react-native-harmony package.',
      default: '@react-native-oh/react-native-harmony',
    },
    {
      name: '--rnoh-cli-npm-package-name [string]',
      description: 'Name of the react-native-harmony-cli package.',
      default: '@react-native-oh/react-native-harmony-cli',
    },
  ],
  func: async (_argv, _config, rawArgs: any) => {
    const fs = new RealFS();
    const logger = new Logger();
    try {
      // input preparation and validation
      if (!rawArgs.bundleName) {
        throw new DescriptiveError({
          whatHappened: "--bundle-name argument wasn't provided",
          whatCanUserDo: ['Please provide --bundle-name argument'],
        });
      }
      const projectRootPath = new AbsolutePath(rawArgs.projectRootPath);
      const harmonyDirPath = projectRootPath.copyWithNewSegment('harmony');

      if (fs.existsSync(harmonyDirPath)) {
        throw new DescriptiveError({
          whatHappened: 'The "harmony" directory is already initialized',
          whatCanUserDo: ["Remove the 'harmony' directory."],
        });
      }
      const rnohNpmPackageName: string = rawArgs.rnohNpmPackageName;
      const rnohNpmPackagePath = projectRootPath.copyWithNewSegment(
        'node_modules',
        rnohNpmPackageName
      );
      if (!fs.existsSync(rnohNpmPackagePath)) {
        throw new DescriptiveError({
          whatHappened: `${rnohNpmPackagePath
            .relativeTo(projectRootPath)
            .toString()} does not exist. This command requires that 'react-native-harmony' NPM package is already installed.`,
          whatCanUserDo: [
            'Install react-native-harmony and try again.',
            'Provide --rnoh-npm-package-name if the default value is incorrect.',
          ],
        });
      }
      const rnohCliNpmPackageName: string = rawArgs.rnohCliNpmPackageName;
      const rnohCliNpmPackagePath = projectRootPath.copyWithNewSegment(
        'node_modules',
        rnohCliNpmPackageName
      );
      if (!fs.existsSync(rnohCliNpmPackagePath)) {
        throw new DescriptiveError({
          whatHappened: `${rnohCliNpmPackagePath
            .relativeTo(projectRootPath)
            .toString()} does not exist. This command requires that 'react-native-cli-harmony' NPM package is already installed.`,
          whatCanUserDo: [
            'Install react-native-harmony-cli and try again.',
            'Provide --rnoh-cli-npm-package-name if the default value is incorrect.',
          ],
        });
      }
      const rnohHvigorPluginPath = findRNOHHvigorPluginPath(
        fs,
        rnohCliNpmPackagePath.copyWithNewSegment('harmony')
      );
      if (rnohHvigorPluginPath === null) {
        throw new DescriptiveError({
          whatHappened: `Couldn't find RNOH hvigor plugin in ${rnohHvigorPluginPath}. This CLI package seems to be incompatible with RNOH.`,
          whatCanUserDo: ['Try using different RNOH or CLI version.'],
        });
      }
      const packageJSON = PackageJSON.fromProjectRootPath(
        fs,
        projectRootPath,
        projectRootPath
      );

      const appName = rawArgs.appName ?? packageJSON.name;
      const bundleName = rawArgs.bundleName;
      if (!isBundleNameValid(bundleName)) {
        throw new DescriptiveError({
          whatHappened: 'Bundle name validation failed',
          whatCanUserDo: [
            `Provide a different project name or provide a bundle name explicitly. Bundle name should have three parts separated by dot e.g. com.org.project and it should match the following regex pattern: ${BUNDLE_NAME_PATTERN}`,
          ],
        });
      }

      const harmonyTemplateDirPath = new AbsolutePath(
        __dirname
      ).copyWithNewSegment('..', 'init', 'templates', 'harmony');
      await ensureDir(harmonyDirPath.toString());

      // processing
      const metroConfigPath =
        projectRootPath.copyWithNewSegment('metro.config.js');
      const metroConfigContent = new MetroConfigTemplate(
        rnohNpmPackageName
      ).build();
      const dynamicTemplateContentByPath = new Map<AbsolutePath, string>([
        [
          harmonyDirPath.copyWithNewSegment('oh-package.json5'),
          new OhPackageJson5Template(rnohNpmPackageName).build(),
        ],
        [
          harmonyDirPath.copyWithNewSegment('hvigor', 'hvigor-config.json5'),
          new HvigorConfigJson5Template(
            rnohCliNpmPackageName,
            rnohHvigorPluginPath!.getBasename()
          ).build(),
        ],
        [
          harmonyDirPath.copyWithNewSegment(
            'entry',
            'src',
            'main',
            'resources',
            'base',
            'element',
            'string.json'
          ),
          new EntryStringVarTemplate(appName, '').build(),
        ],
        [
          harmonyDirPath.copyWithNewSegment(
            'entry',
            'src',
            'main',
            'ets',
            'pages',
            'Index.ets'
          ),
          new EntryIndexTemplate(appName).build(),
        ],
        [
          harmonyDirPath.copyWithNewSegment(
            'AppScope',
            'resources',
            'base',
            'element',
            'string.json'
          ),
          new AppScopeStringVarTemplate(appName).build(),
        ],
        [
          harmonyDirPath.copyWithNewSegment('AppScope', 'app.json5'),
          new AppScopeAppJSON5Template(bundleName).build(),
        ],
      ]);

      // output
      if (fs.existsSync(metroConfigPath)) {
        if (fs.existsSync(projectRootPath.copyWithNewSegment('.git'))) {
          logger.warn((s) => `Overwritten "${s.bold('./metro.config.js')}"`);
          fs.writeTextSync(metroConfigPath, metroConfigContent);
        } else {
          logger.warn(
            (s) =>
              `Skipped overriding "${s.bold(
                './metro.config.js'
              )}" due to lack of .git. Override "${s.bold(
                './metro.config.js'
              )}" manually.`
          );
          console.log(metroConfigContent);
        }
      } else {
        fs.writeTextSync(metroConfigPath, metroConfigContent);
      }

      await dirCopy(
        harmonyTemplateDirPath.toString(),
        harmonyDirPath.toString()
      );
      renameGitignoreFiles(fs, harmonyDirPath);
      logger.succeed((s) => `Created "${s.bold('./harmony')}" directory`);
      dynamicTemplateContentByPath.forEach((content, path) => {
        fs.writeTextSync(path, content);
      });

      const buildProfileTemplateComment = "build-profile.json5 can contain signingConfigs which are unique for each developer, therefore that file is ignored by Git. Create a build-profile.json5 based on this template after cloning this repository to be able to open this project in DevEco Studio.";

      const buildProfilePath = harmonyDirPath.copyWithNewSegment('build-profile.json5');
      const buildProfileContent = fs.readTextSync(buildProfilePath);
      const contentLines = buildProfileContent.split('\n');
      contentLines.splice(1, 0, "  // " + buildProfileTemplateComment);
      const buildProfileTemplateContent = contentLines.join('\n');

      fs.writeTextSync(
        harmonyDirPath.copyWithNewSegment('build-profile.template.json5'),
        buildProfileTemplateContent
      );

      logger.info((s) =>
        [
          s.bold('Run on a physical device:'),
          s.gray('1. Run `npm start` to start the Metro server.'),
          s.gray(
            '2. Open `./harmony` project in DevEco Studio and wait for background jobs to finish.'
          ),
          s.gray(
            '3. Press the user icon in top right corner, and then press "Sign in" button.'
          ),
          s.gray('4. Connect the device.'),
          s.gray(
            '5. Go to File > Project Structure > Signing Configs and mark "Automatically generate signature", and then press OK.'
          ),
          s.gray("6. Select 'entry' run configuration (top right corner)."),
          s.gray("7. Press the `Debug 'entry'` button (top right corner)."),
        ].join('\n')
      );
    } catch (err) {
      if (err instanceof DescriptiveError && !err.isUnexpected()) {
        logger.descriptiveError(err);
        return;
      }
      throw err;
    }
  },
};

function findRNOHHvigorPluginPath(
  fs: RealFS,
  dirPath: AbsolutePath
): AbsolutePath | null {
  for (let dirent of fs.readDirentsSync(dirPath)) {
    if (dirent.isDirectory() || !dirent.name.startsWith('rnoh-hvigor-plugin')) {
      continue;
    }
    return dirent.path;
  }
  return null;
}

/**
 * In the template directory, gitignore files don't start with a dot.
 * After copying the template, those files need to be renamed.
 */
function renameGitignoreFiles(fs: RealFS, dirPath: AbsolutePath) {
  try {
    for (const dirent of fs.readDirentsSync(dirPath)) {
      if (dirent.isDirectory()) {
        renameGitignoreFiles(fs, dirent.path);
      } else if (!dirent.isDirectory() && dirent.name === 'gitignore') {
        const newFilePath = dirPath.copyWithNewSegment('.gitignore');
        fs.renameSync(dirent.path, newFilePath);
      }
    }
  } catch (error) {
    throw new DescriptiveError({
      whatHappened: 'Encounter an error when processing .gitignore files',
      extraData: error,
    });
  }
}

function isBundleNameValid(bundleName: string): boolean {
  return (
    BUNDLE_NAME_PATTERN.test(bundleName) && bundleName.split('.').length === 3
  );
}
