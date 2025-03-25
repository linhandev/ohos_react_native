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
              try {
                this.commandExecutor.run(
                  "node_modules/.bin/react-native bundle-harmony",
                  bundlerOptions,
                  {
                    encoding: "utf-8",
                    stdio: "ignore",
                    cwd: pathUtils.join(this.input.nodeModulesPath, ".."),
                  }
                );
                this.logger.info(`[bundler] done generating bundle`);
              } catch (err) {
                this.logger.error(`[bundler] failed: ${err}`);
              }
            },
            dependencies: [`${targetName}@PackageHap`],
            postDependencies: ["assembleHap"],
          });
        });
      });
    });
  }
}
