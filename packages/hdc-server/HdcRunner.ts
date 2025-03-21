import {execSync} from 'node:child_process';
import {globSync} from 'glob';
import pathUtils from 'node:path';

export class HdcRunner {
  target: string;
  hdcPath: string;

  constructor(target: string) {
    this.target = target;

    const DEVECO_SDK_HOME = process.env.DEVECO_SDK_HOME;
    if (!DEVECO_SDK_HOME) {
      throw new Error('DEVECO_SDK_HOME environment variable is undefined');
    }

    const basePath = pathUtils.join(DEVECO_SDK_HOME, '..');
    const files = globSync(`${basePath}/**/hdc`, {nodir: true});
    if (files.length === 0) {
      throw new Error('hdc not found in DEVECO_SDK_HOME');
    }

    this.hdcPath = files[0];
  }

  public run(command: string): string {
    const cmd = `${this.hdcPath} -t ${this.target} shell ${command}`;
    console.log('running: ' + cmd);
    const result = execSync(cmd).toString();
    return result;
  }
}
