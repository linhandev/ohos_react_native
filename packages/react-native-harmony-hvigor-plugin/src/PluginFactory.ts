import { HvigorNode, HvigorPlugin } from "@ohos/hvigor";
import { PrebuildTask } from "./PrebuildTask";
import fs from "node:fs";
import { Logger } from "./Logger";
import { BuildTask } from "./BuildTask";
import { CommandExecutor } from "./CommandExecutor";
import { RNOHModulePluginOptions, RNOHProjectPluginOptions } from "./types";

export function createRNOHModulePlugin(
  options: RNOHModulePluginOptions
): HvigorPlugin {
  return {
    pluginId: "rnohModulePlugin",
    apply: () => {
      const commandExecutor = new CommandExecutor();
      const logger = new Logger();
      const task = new PrebuildTask(commandExecutor, logger, fs);
      task.run(options);
    },
  };
}

export function createRNOHProjectPlugin(
  options?: RNOHProjectPluginOptions
): HvigorPlugin {
  return {
    pluginId: "rnohProjectPlugin",
    apply: (currentNode: HvigorNode) => {
      const commandExecutor = new CommandExecutor();
      const logger = new Logger();
      const task = new BuildTask(commandExecutor, logger, fs, currentNode);
      task.run(options);
    },
  };
}
