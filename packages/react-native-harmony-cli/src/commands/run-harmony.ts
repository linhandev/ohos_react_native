import { AbsolutePath, DescriptiveError } from '../core';
import { Logger, RealFS } from '../io';
import { RealCliExecutor } from '../io/CliExecutor';
import { Command } from './types';
import crypto from 'node:crypto';
import JSON5 from 'json5';

const COMMAND_NAME = 'run-harmony';

export const commandRunHarmony: Command = {
  name: COMMAND_NAME,
  description: 'Builds your app and starts it on your phone.',
  options: [
    {
      name: '--harmony-project-path <path>',
      description: 'Specifies the root of your OpenHarmony project.',
      default: './harmony',
    },
    {
      name: '--module <string>',
      description: 'Name of the OH module to run.',
      default: 'entry',
    },
    {
      name: '--build-mode <string>',
      description: 'Debug or Release.',
      default: 'debug',
    },
    {
      name: '--product <string>',
      description: 'OpenHarmony product defined in build-profile.json5.',
      default: 'default',
    },
    {
      name: '--ability <string>',
      description: 'Name of the ability to start.',
      default: 'EntryAbility',
    },
  ],
  func: async (_argv, _config, rawArgs: any) => {
    const logger = new Logger();
    try {
      const DEVECO_SDK_HOME = process.env.DEVECO_SDK_HOME;
      if (!DEVECO_SDK_HOME) {
        throw new DescriptiveError({
          whatHappened: 'DEVECO_SDK_HOME environment variable is not set',
          whatCanUserDo: [
            process.platform === 'darwin'
              ? 'On MacOS, the contents directory is typically located at: /Applications/DevEco-Studio.app/Contents/sdk. Set this path as the value of DEVECO_SDK_HOME'
              : "Locate the installation directory of DevEco Studio, and set its 'sdk' subdirectory as the value of DEVECO_SDK_HOME environment variable.",
          ],
        });
      }
      const fs = new RealFS();
      const sdkPath = new AbsolutePath(DEVECO_SDK_HOME);
      const sdkDirectoryNames = fs
        .readDirentsSync(sdkPath)
        .flatMap((dirent) => {
          if (dirent.isDirectory()) {
            return [dirent.name];
          } else {
            return [];
          }
        });
      if (sdkDirectoryNames.length === 0) {
        throw new DescriptiveError({
          whatHappened: `${sdkPath.toString()} has no directories`,
          unexpected: true,
        });
      }
      const sdkToolchainsPath = sdkPath.copyWithNewSegment(
        sdkDirectoryNames[0],
        'openharmony',
        'toolchains'
      );
      const cli = new RealCliExecutor();
      const harmonyProjectPath = new AbsolutePath(rawArgs.harmonyProjectPath);
      const productName: string = rawArgs.product;
      const buildMode: string = rawArgs.buildMode;
      const moduleName: string = rawArgs.module;
      const abilityName: string = rawArgs.ability;
      const devEcoStudioToolsPath = new AbsolutePath(
        DEVECO_SDK_HOME
      ).copyWithNewSegment('..', 'tools');
      if (!fs.existsSync(devEcoStudioToolsPath)) {
        throw new DescriptiveError({
          whatHappened: `${devEcoStudioToolsPath.toString()} doesn't exist`,
        });
      }
      const bundleName = JSON5.parse(
        fs.readTextSync(
          harmonyProjectPath.copyWithNewSegment('AppScope', 'app.json5')
        )
      ).app.bundleName;

      const runJob = async (name: string, job: () => Promise<void>) => {
        const stop = logger.start((s) => s.bold(name));
        logger.info((s) => s.bold(`${name} started`));
        try {
          await job();
          logger.succeed((s) => s.bold(`${name} finished`));
        } catch (err) {
          if (err instanceof DescriptiveError) {
            throw err;
          }
          throw new DescriptiveError({
            whatHappened: `${name} failed`,
            extraData: err,
          });
        } finally {
          stop();
        }
      };

      await runJob('[1/2] building app', async () => {
        await cli.run(
          devEcoStudioToolsPath
            .copyWithNewSegment('node', 'bin', 'node')
            .toString(),
          {
            args: [
              devEcoStudioToolsPath
                .copyWithNewSegment('hvigor', 'bin', 'hvigorw.js')
                .toString(),
              `-p`,
              `module=${moduleName}@default`,
              `-p`,
              `product=${productName}`,
              `-p`,
              `buildMode=${buildMode}`,
              `-p`,
              `requiredDeviceType=phone`,
              `assembleHap`,
            ],
            cwd: harmonyProjectPath,
            onArgsStringified: (commandWithArgs) => {
              logger.debug((s) => s.bold(s.gray(commandWithArgs)));
            },
            onStdout: (msg) => {
              logger.debug((s) => s.gray(msg.trimEnd()));
            },
            onStderr(msg) {
              logger.debug(() => msg.trimEnd());
            },
          }
        );
      });
      await runJob('[2/2] installing and opening app', async () => {
        const tmpDirName = generateRandomString();
        const ohosTmpDirPath = `data/local/tmp/${tmpDirName}`;

        const exec = async (command: string, args: string[]) => {
          const result = await cli.run(command, {
            args: args,
            onArgsStringified: (commandWithArgs) =>
              logger.debug((s) => s.bold(s.gray(commandWithArgs))),
          });
          if (result.startsWith('[Fail]')) {
            throw new DescriptiveError({ whatHappened: result });
          }
          if (result) {
            logger.debug((s) => s.gray(result.trimEnd() + '\n'));
          } else {
            logger.debug(() => '');
          }
          return result;
        };

        const hdcPathStr = sdkToolchainsPath
          .copyWithNewSegment('hdc')
          .toString();
        await exec(hdcPathStr, ['shell', 'aa', 'force-stop', bundleName]);
        try {
          await exec(hdcPathStr, ['shell', 'mkdir', ohosTmpDirPath]);
          await exec(hdcPathStr, [
            'file',
            'send',
            harmonyProjectPath
              .copyWithNewSegment(
                moduleName,
                'build',
                'default',
                'outputs',
                'default',
                `${moduleName}-default-signed.hap`
              )
              .toString(),
            ohosTmpDirPath,
          ]);
          const installationResult = await exec(hdcPathStr, [
            'shell',
            'bm',
            'install',
            '-p',
            ohosTmpDirPath,
          ]);
          if (installationResult.includes('failed to install')) {
            throw new DescriptiveError({
              whatHappened: 'Installation failed.',
              whatCanUserDo: [
                `If an application with the same bundle name is already installed, try uninstalling it:\n${hdcPathStr} shell bm uninstall -n ${bundleName}`,
              ],
            });
          }
        } finally {
          await exec(hdcPathStr, ['shell', 'rm', '-rf', ohosTmpDirPath]);
        }
        await exec(hdcPathStr, [
          'shell',
          'aa',
          'start',
          '-a',
          abilityName,
          '-b',
          bundleName,
        ]);
      });
    } catch (err) {
      if (err instanceof DescriptiveError) {
        logger.descriptiveError(
          new DescriptiveError({
            whatHappened: err.getMessage(),
            whatCanUserDo: [
              ...err.getSuggestions(),
              'Try building and running the app from DevEco studio.',
            ],
            extraData: err.getRawData().extraData,
          })
        );
      } else {
        throw err;
      }
    }
  },
};

function generateRandomString(length: number = 32): string {
  const chars: string = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result: string = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % chars.length;
    result += chars[randomIndex];
  }
  return result;
}
