import { Logger } from "../../common/Logger";
import { HvigorNode } from "@ohos/hvigor";
import pathUtils from "node:path";
import {
  FS,
  Subtask,
  RNOHProjectPluginError,
  RNOHProjectPluginOptions,
} from "../../types";
import { CommandExecutor } from "../../common/CommandExecutor";
import { BundlerSubtask, BundlerConfig } from "./BundlerSubtask";

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
      pathUtils.join(process.cwd(), "../node_modules");
    if (!this.fs.existsSync(nodeModulesPath)) {
      throw new ValidationError("nodeModulesPath", "path doesn't exist");
    }
    const bundlerArgs = {
      ...options?.bundler,
      enabled: options?.bundler?.enabled ?? true,
      dev: options?.bundler?.dev?.toString() ?? "false",
      hermescOptions: options?.bundler?.hermescOptions ?? "O",
    };
    return {
      nodeModulesPath,
      bundler: bundlerArgs,
    };
  }

  private runSubtasks(input: {
    nodeModulesPath: string;
    bundler: BundlerConfig;
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
