import { Logger } from "../../common/Logger";
import { CommandExecutor } from "../../common/CommandExecutor";
import * as pathUtils from "node:path";

export type AutolinkingArgs = {
  harmonyProjectPath: string;
  nodeModulesPath: string;
  cmakeAutolinkPathRelativeToHarmony: string;
  cppRnohPackagesFactoryPathRelativeToHarmony: string;
  etsRnohPackagesFactoryPathRelativeToHarmony: string;
  ohPackagePathRelativeToHarmony: string;
  excludeNpmPackages: string | undefined;
  includeNpmPackages: string | undefined;
};

export type AutolinkingSubtaskInput = AutolinkingArgs | null;

export class AutolinkingSubtask {
  constructor(
    private commandExecutor: CommandExecutor,
    private logger: Logger,
    private input: AutolinkingSubtaskInput
  ) {}

  run(): void {
    if (this.input === null) {
      this.logger.warn(`[autolink] skipped`);
      return;
    }
    const result = this.commandExecutor.run(
      pathUtils.join(this.input.nodeModulesPath, ".bin", "react-native") +
        " link-harmony",
      this.input
    );
    this.logger.info(`[autolink]\n${result}`);
  }
}
