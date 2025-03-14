import { Logger } from './Logger';
import { HvigorNode, hvigor } from '@ohos/hvigor';
import {
  OhosAppContext,
  OhosHapContext,
  OhosPluginId,
  Target,
} from '@ohos/hvigor-ohos-plugin';
import pathUtils from 'node:path';
import {
  FS,
  Subtask,
  BundlerConfig,
  RNOHProjectPluginError,
  RNOHProjectPluginOptions,
} from './types';
import { CommandExecutor } from './CommandExecutor';

type ResolvedBundlerConfig = Omit<BundlerConfig, 'dev' | 'hermescOptions'> & {
  dev: string;
  hermescOptions: string;
};

export class ValidationError extends RNOHProjectPluginError {
  constructor(optionName: keyof RNOHProjectPluginOptions, msg: string) {
    super(`ValidationError: ${optionName} — ${msg}`);
  }
}

export class BuildTask {
  constructor(
    private commandExecutor: CommandExecutor,
    private logger: Logger,
    private fs: FS,
    private currentNode: HvigorNode
  ) {}

  run(options?: RNOHProjectPluginOptions) {
    try {
      const input = this.prepareInput(options);
      this.runSubtasks(input);
    } catch (err) {
      if (err instanceof RNOHProjectPluginError) {
        this.logger.error(err.message);
        throw err;
      }
      throw err;
    }
  }

  private prepareInput(options?: RNOHProjectPluginOptions) {
    const nodeModulesPath =
      options?.nodeModulesPath ??
      pathUtils.join(process.cwd(), '../node_modules');
    if (!this.fs.existsSync(nodeModulesPath)) {
      throw new ValidationError('nodeModulesPath', "path doesn't exist");
    }
    const bundlerArgs = {
      ...options?.bundler,
      enabled: options?.bundler?.enabled ?? true,
      dev: options?.bundler?.dev?.toString() ?? 'false',
      hermescOptions: options?.bundler?.hermescOptions ?? 'O',
    };
    return {
      nodeModulesPath,
      bundler: bundlerArgs,
    };
  }

  private runSubtasks(input: {
    nodeModulesPath: string;
    bundler: ResolvedBundlerConfig;
  }) {
    (
      [
        new BundlerSubtask(
          this.commandExecutor,
          this.logger,
          this.currentNode,
          input
        ),
      ] satisfies Subtask[]
    ).forEach((subtask) => subtask.run());
  }
}

class BundlerSubtask implements Subtask {
  constructor(
    private commandExecutor: CommandExecutor,
    private logger: Logger,
    private node: HvigorNode,
    private input: {
      nodeModulesPath: string;
      bundler: ResolvedBundlerConfig;
    }
  ) {}

  run(): void {
    hvigor.nodesEvaluated(() => {
      const appContext: OhosAppContext = this.node.getContext(
        OhosPluginId.OHOS_APP_PLUGIN
      );
      const buildMode = appContext.getBuildMode();
      this.node.subNodes((node: HvigorNode) => {
        const hapContext: OhosHapContext = node.getContext(
          OhosPluginId.OHOS_HAP_PLUGIN
        );
        hapContext?.targets((target: Target) => {
          const targetName = target.getTargetName();
          node.registerTask({
            name: `${targetName}@CreateJSBundle`,
            run: () => {
              const bundlerOptions = this.input.bundler;
              if (
                !this.input.nodeModulesPath ||
                !bundlerOptions.enabled ||
                buildMode !== 'release'
              ) {
                this.logger.warn(`[bundler] skipped`);
                return;
              }
              delete bundlerOptions.enabled;
              try {
                this.commandExecutor.run(
                  'node_modules/.bin/react-native bundle-harmony',
                  bundlerOptions,
                  {
                    encoding: 'utf-8',
                    stdio: 'ignore',
                    cwd: pathUtils.join(this.input.nodeModulesPath, '..'),
                  }
                );
                this.logger.info(`[bundler] done generating bundle`);
              } catch (err) {
                this.logger.error(`[bundler] failed: ${err}`);
              }
            },
            dependencies: [`${targetName}@PackageHap`],
            postDependencies: ['assembleHap'],
          });
        });
      });
    });
  }
}
