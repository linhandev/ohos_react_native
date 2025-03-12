import {execSync} from 'node:child_process';
import * as pathUtils from 'path';

export class HdcRunner {
  target: string;
  hdcPath: string;

  constructor(target: string) {
    this.target = target;

    const DEVECO_SDK_HOME = process.env.DEVECO_SDK_HOME;
    if (!DEVECO_SDK_HOME) {
      throw new Error('DEVECO_SDK_HOME environment variable is undefined');
    }

    this.hdcPath = pathUtils.join(
      DEVECO_SDK_HOME,
      'default',
      'openharmony',
      'toolchains',
      'hdc',
    );
  }

  public run(command: string): string {
    const cmd = `${this.hdcPath} -t ${this.target} shell ${command}`;
    console.log('running: ' + cmd);
    const result = execSync(cmd).toString();
    return result;
  }
}
