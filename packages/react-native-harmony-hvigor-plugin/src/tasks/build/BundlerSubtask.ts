import { HvigorNode, hvigor } from "@ohos/hvigor";
import {
  OhosAppContext,
  OhosPluginId,
  OhosHapContext,
  Target,
} from "@ohos/hvigor-ohos-plugin";
import * as pathUtils from "node:path";
import { CommandExecutor } from "../../common/CommandExecutor";
import { BundlerConfig as BaseBundlerConfig, Subtask } from "../../types";
import { Logger } from "../../common/Logger";

export type BundlerConfig = Omit<
  BaseBundlerConfig,
  "dev" | "hermescOptions"
> & {
  dev: string;
  hermescOptions: string;
};

export class BundlerSubtask implements Subtask {
  constructor(
    private commandExecutor: CommandExecutor,
    private logger: Logger,
    private node: HvigorNode,
    private input: {
      nodeModulesPath: string;
      bundler: BundlerConfig;
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
                buildMode !== "release"
              ) {
                this.logger.warn(`[bundler] skipped`);
                return;
              }
              delete bundlerOptions.enabled;
              const projectRootPath = pathUtils.resolve(this.input.nodeModulesPath, '..');
              const configRelativeToRoot = bundlerOptions.config ?
                pathUtils.relative(projectRootPath, bundlerOptions.config) : undefined;
              const bundleOutputeRelativeToRoot = bundlerOptions.bundleOutput ?
                pathUtils.relative(projectRootPath, bundlerOptions.bundleOutput) : undefined;
              const assetsDestRelativeToRoot = bundlerOptions.assetsDest ?
                pathUtils.relative(projectRootPath, bundlerOptions.assetsDest) : undefined;
              const sourcemapOutputRelativeToRoot = bundlerOptions.sourcemapOutput ?
                pathUtils.relative(projectRootPath, bundlerOptions.sourcemapOutput) : undefined;
              try {
                this.commandExecutor.run(
                  `node_modules${pathUtils.sep}.bin${pathUtils.sep}react-native bundle-harmony`,
                  {
                    ...bundlerOptions,
                    config: configRelativeToRoot,
                    bundleOutput: bundleOutputeRelativeToRoot,
                    assetsDest: assetsDestRelativeToRoot,
                    sourcemapOutput: sourcemapOutputRelativeToRoot
                  },
                  {
                    encoding: "utf-8",
                    stdio: "ignore",
                    cwd: projectRootPath,
                  }
                );
                this.logger.info(`[bundler] done generating bundle`);
              } catch (err) {
                this.logger.error(`[bundler] failed: ${err}`);
              }
            },
            dependencies: [`${targetName}@ProcessResource`],
            postDependencies: [`${targetName}@CompileResource`],
          });
        });
      });
    });
  }
}
