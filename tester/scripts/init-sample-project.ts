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
    'npx --yes @react-native-community/cli@latest init __SampleProject__ --version 0.77.0 --skip-install',
    'cd __SampleProject__',
    'npm i',
    'echo \'@rnoh:registry=https://gl.swmansion.com/api/v4/projects/458/packages/npm/\n//gl.swmansion.com/api/v4/projects/458/packages/npm/:_authToken="${RNOH_NPM_TOKEN}"\' > .npmrc',
    'npm i',
    'npm i @react-native-oh/react-native-core@npm:@rnoh/react-native-core',
    'npm i ../../react-native-harmony/rnoh-react-native-harmony-0.77.0.tgz',
    'cd ../../react-native-harmony-cli',
    'npm pack',
    'cd ../tester/__SampleProject__',
    'npm i ../../react-native-harmony-cli/rnoh-react-native-harmony-cli-0.77.0.tgz',
    './node_modules/.bin/react-native init-harmony --bundle-name com.rnoh.sample_project --rnoh-npm-package-name @rnoh/react-native-harmony --rnoh-cli-npm-package-name @rnoh/react-native-harmony-cli',
  ].join(' && '),
);
