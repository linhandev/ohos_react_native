import {exec as exec_} from 'child_process';

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

exec(
  [
    'npx --yes @react-native-community/cli@latest init __SampleProject__ --version 0.77.1 --skip-install',
    'cd __SampleProject__',
    'cd ../../react-native-harmony',
    'npx rimraf *.tgz',
    'pnpm pack',
    'PACKAGE_TARBALL=$(ls *.tgz)',
    'cd -',
    'npm i ../../react-native-harmony/$PACKAGE_TARBALL',
    'cd ../../react-native-harmony-cli',
    'npx rimraf *.tgz',
    'pnpm pack',
    'PACKAGE_TARBALL=$(ls *.tgz)',
    'cd -',
    'npm i --save-dev ../../react-native-harmony-cli/$PACKAGE_TARBALL',
    'npx react-native init-harmony --bundle-name com.rnoh.sample_project',
  ].join(' && '),
);
