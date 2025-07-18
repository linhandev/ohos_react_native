import {exec as exec_} from 'child_process';
import path from 'path';
import fs from 'fs';

async function exec(command: string) {
  return new Promise((resolve, reject) => {
    const child = exec_(command);

    let output = '';
    child.stdout?.on('data', data => {
      process.stdout.write(data);
      output += data;
    });

    child.stderr?.on('data', data => {
      process.stderr.write(data);
      output += data;
    });

    child.on('error', error => {
      reject(error);
    });

    child.on('close', code => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function findAndInstallTalBall(
  projectDir: string,
  targetDir: string,
  dev: boolean = false,
) {
  return new Promise((resolve, reject) => {
    fs.readdir(targetDir, (error, files) => {
      if (error) {
        reject(error);
      }
      const tgzFiles = files.filter(f => f.endsWith('.tgz'));
      if (tgzFiles.length === 0) {
        reject(new Error('No .tgz files found'));
      }
      const talBall = tgzFiles[0];

      exec(
        [
          `cd ${projectDir}`,
          `npm i ${dev ? '--save-dev' : ''} ${targetDir}/${talBall}`,
        ].join(' && '),
      )
        .then(resolve)
        .catch(reject);
    });
  });
}

(async () => {
  const projectDir = path.resolve(__dirname, '../__SampleProject__');
  const cliDir = path.resolve(__dirname, '../../react-native-harmony-cli');
  const rnHarmonyDir = path.resolve(__dirname, '../../react-native-harmony');
  await exec(
    [
      'npx --yes @react-native-community/cli@latest init __SampleProject__ --version 0.77.1 --skip-install',
      'cd __SampleProject__',
      'cd ../../react-native-harmony-cli',
      'npx rimraf *.tgz',
      'pnpm pack',
      'cd ../react-native-harmony',
      'npx rimraf *.tgz',
      'pnpm pack',
    ].join(' && '),
  );
  await findAndInstallTalBall(projectDir, cliDir, true);
  await findAndInstallTalBall(projectDir, rnHarmonyDir);
  await exec(
    [
      `cd ${projectDir}`,
      'npx react-native init-harmony --bundle-name com.rnoh.sample_project',
    ].join(' && '),
  );
})();
