import { Logger } from "../../common/Logger";
import { CommandExecutor } from "../../common/CommandExecutor";
import { CodegenConfig, Subtask } from "../../types";
import * as pathUtils from "node:path";

export type CodegenSubtaskInput = CodegenConfig | null;

export class CodegenSubtask implements Subtask {
  constructor(
    private commandExecutor: CommandExecutor,
    private logger: Logger,
    private nodeModulesPath: string,
    private input: CodegenSubtaskInput
  ) {}

  run(): void {
    if (this.input === null) {
      this.logger.warn("[codegen] skipped");
      return;
    }
    const result = this.commandExecutor.run(
      `node_modules${pathUtils.sep}.bin${pathUtils.sep}react-native codegen-harmony`,
      this.input,
      {
        encoding: "utf-8",
        cwd: pathUtils.join(this.nodeModulesPath, "..")
      }
    );
    this.logger.info(`[codegen]\n${result}`);
  }
}
