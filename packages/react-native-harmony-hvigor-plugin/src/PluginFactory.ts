import { HvigorNode, HvigorPlugin } from "@ohos/hvigor";
import { SyncTask } from "./tasks/sync/SyncTask";
import fs from "node:fs";
import { Logger } from "./common/Logger";
import { BuildTask } from "./tasks/build/BuildTask";
import { CommandExecutor } from "./common/CommandExecutor";
import { RNOHModulePluginOptions, RNOHProjectPluginOptions } from "./types";

export function createRNOHModulePlugin(
  options: RNOHModulePluginOptions
): HvigorPlugin {
  return {
    pluginId: "rnohModulePlugin",
    apply: () => {
      const commandExecutor = new CommandExecutor();
      const logger = new Logger();
      const task = new SyncTask(commandExecutor, logger, fs);
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
