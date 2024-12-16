import { Command } from './types';
import { Logger, RealFS } from '../io';
import {
  MetroConfigTemplate,
  BuildProfileTemplate,
  EntryStringVarTemplate,
  EntryIndexTemplate,
} from '../init/templates';
import { execSync } from 'child_process';
import { AbsolutePath, DescriptiveError, PackageJSON } from '../core';
import { copy as dirCopy, ensureDir, renameSync, readdirSync } from 'fs-extra';
import pathUtils from 'node:path';
import { AppScopeStringVarTemplate } from '../init/templates/AppScopeStringVarTemplate';
import { AppScopeAppJSON5Template } from '../init/templates/AppScopeAppJSON5Template';

const COMMAND_NAME = 'init-harmony';

export const commandInitHarmony: Command = {
  name: COMMAND_NAME,
  description: 'Initializes a new RNOH project.',
  options: [
    {
      name: '--name [string]',
      description:
        'The native project name. Defaults to the name property in package.json',
      default: undefined,
    },
    {
      name: '--description [string]',
      description: 'The native project description.',
      default: '',
    },
    {
      name: '--bundle-name [string]',
      description:
        'The native project bundle name. Defaults to com.example.{native project name}',
      default: undefined,
    },
  ],
  func: async (_argv, _config, rawArgs: any) => {
    const fs = new RealFS();
    const logger = new Logger();
    const stop = logger.start((s) => s.bold('init'));
    logger.info((s) => s.bold(`RNOH Init started`));
    const projectPath = new AbsolutePath(process.cwd());
    const harmonyPath = new AbsolutePath('./harmony');

    if (fs.existsSync(harmonyPath)) {
      logger.descriptiveError(
        new DescriptiveError({
          whatHappened: 'Harmony was already initialized.',
          whatCanUserDo: ["Remove 'harmony' folder to reinitialize."],
        })
      );
      stop();
      return;
    }

    const packageJSON = PackageJSON.fromProjectRootPath(
      fs,
      projectPath,
      projectPath
    );

    const appName = rawArgs.name ?? packageJSON.name;
    const appBundleName =
      rawArgs.bundleName ??
      `com.example.${appName.toLowerCase().replace(/ /g, '_')}`;

    logger.info((s) => s.bold(`Copying files`));
    const harmonySrc = pathUtils.join(__dirname, '../init/templates/harmony');
    const harmonyDest = pathUtils.join(projectPath.toString(), 'harmony');

    await ensureDir(harmonyDest);
    await dirCopy(harmonySrc, harmonyDest);

    renameGitignoreFiles(harmonyDest);

    const metroConfigContent = new MetroConfigTemplate().build();
    const metroConfigPath = new AbsolutePath('./metro.config.js');
    fs.writeTextSync(metroConfigPath, metroConfigContent);

    const buildProfileContent = new BuildProfileTemplate().build();
    const buildProfilePath = new AbsolutePath('./harmony/build-profile.json5');
    fs.writeTextSync(buildProfilePath, buildProfileContent);

    const entryStringVarContent = new EntryStringVarTemplate(
      appName,
      rawArgs.description
    ).build();
    const entryStringVarPath = new AbsolutePath(
      './harmony/entry/src/main/resources/base/element/string.json'
    );
    fs.writeTextSync(entryStringVarPath, entryStringVarContent);

    const entryIndexContent = new EntryIndexTemplate(appName).build();
    const entryIndexPath = new AbsolutePath(
      './harmony/entry/src/main/ets/pages/Index.ets'
    );
    fs.writeTextSync(entryIndexPath, entryIndexContent);

    const appScopeStringVarContent = new AppScopeStringVarTemplate(
      appName
    ).build();
    const appScopeStringVarPath = new AbsolutePath(
      './harmony/AppScope/resources/base/element/string.json'
    );
    fs.writeTextSync(appScopeStringVarPath, appScopeStringVarContent);

    const appScopeAppJSON5Content = new AppScopeAppJSON5Template(
      appBundleName
    ).build();
    const appScopeAppJSON5Path = new AbsolutePath(
      './harmony/AppScope/app.json5'
    );
    fs.writeTextSync(appScopeAppJSON5Path, appScopeAppJSON5Content);

    logger.succeed((s) => s.bold(`RNOH Init finished`));
    stop();
  },
};

function renameGitignoreFiles(dir: string) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = pathUtils.join(dir, entry.name);
      if (entry.isDirectory()) {
        renameGitignoreFiles(entryPath);
      } else if (entry.isFile() && entry.name === 'gitignore') {
        const newFilePath = pathUtils.join(dir, '.gitignore');
        renameSync(entryPath, newFilePath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory "${dir}":`, error);
  }
}
