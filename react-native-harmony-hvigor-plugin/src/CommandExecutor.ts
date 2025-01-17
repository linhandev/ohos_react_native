import { execSync, ExecSyncOptionsWithStringEncoding } from "node:child_process";
import { toKebabCase } from "./utils/kebabCase";

export class CommandExecutor {
  public run(
    command: string,
    args?: Record<string, string | number | boolean | undefined>,
    execOptions: ExecSyncOptionsWithStringEncoding = {
      encoding: "utf-8",
    }
  ): string {
    let commandWithArgs = command;
    if (args) {
      commandWithArgs += " " + this.stringifyCliArgs(args);
    }
    return execSync(commandWithArgs, execOptions);
  }

  protected stringifyCliArgs(
    args: Record<string, string | number | boolean | undefined>
  ): string {
    return Object.entries(args)
      .filter(([_, value]) => {
        if (typeof value === "boolean") {
          return value;
        }
        return value !== undefined && value !== null;
      })
      .map(([key, value]) => {
        if (value === undefined) return "";

        const formattedKey = toKebabCase(key);

        if (typeof value === "boolean") {
          return `--${formattedKey}`;
        }

        return `--${formattedKey} ${value}`;
      })
      .join(" ");
  }
}
