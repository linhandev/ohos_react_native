// @ts-check
const { exec: exec_ } = require('child_process');
const fs = require('node:fs');
const readline = require('readline');

const RNOH_REPO_TOKEN = process.env.RNOH_REPO_TOKEN ?? '';

const GITLAB_URL = 'https://gl.swmansion.com';
const HAR_FILE_OUTPUT_PATH =
  'tester/harmony/react_native_openharmony/build/default/outputs/default/react_native_openharmony.har';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * @param {boolean} condition
 * @param {string} msg
 */
function assert(condition, msg) {
  if (!condition) {
    console.error(msg);
    process.exit(1);
  }
}

/**
 * @param {string} command
 * @returns {Promise<string>}
 */
async function exec(command) {
  return new Promise((resolve, reject) => {
    const child = exec_(command);

    let output = '';
    child.stdout?.on('data', (data) => {
      process.stdout.write(data);
      output += data;
    });

    child.stderr?.on('data', (data) => {
      process.stderr.write(data);
      output += data;
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}
async function runDeployment() {
  assert(!!RNOH_REPO_TOKEN, 'RNOH_REPO_TOKEN not found');
  assert(
    process.cwd().endsWith('react-native-harmony'),
    'This script should be executed from react-native-harmony directory'
  );
  assert(
    await isRepositoryPrepared(),
    'Repository should be on the main branch and up to date with upstream.'
  );

  let version = '';
  const currentVersion = JSON.parse(
    fs.readFileSync('./package.json').toString()
  )['version'];
  rl.question(
    `Current version: ${currentVersion}. Enter new version: `,
    async (newVersion) => {
      version = newVersion;

      await exec(`npm run _update:version  -- --new-version ${version}`);
      await exec(`npm run build:har`);
      fs.rmSync('./harmony', { recursive: true, force: true });
      fs.mkdirSync('./harmony');
      fs.renameSync(
        `../${HAR_FILE_OUTPUT_PATH}`,
        './harmony/react_native_openharmony.har'
      );

      const changelogForCurrentVersion = await exec(`npm run -s gen:changelog`);

      updateChangelog(version, changelogForCurrentVersion);

      await exec(`npm publish --dry-run`);

      rl.question(
        'Are changes good to be published and pushed to the upstream? (yes/no): ',
        async (answer) => {
          if (answer.toLowerCase() === 'yes') {
            await exec(`npm publish`);
            console.log('NPM Package was published successfully.');
            await exec(
              `git checkout -b release-react-native-harmony-${version}`
            );
            await exec('git add -A');
            await exec(
              `git commit -m "release: react-native-harmony@${version}"`
            );
            await exec(`git push -u origin HEAD --no-verify`);

            await exec(`git tag v${version}`);
            await exec(`git push -u origin v${version} --no-verify`);
            const mergeRequestId = await createMergeRequest(
              `release-react-native-harmony-${version}`,
              `release: react-native-harmony@${version}`
            );
            console.log(`Please merge the following Merge Request:\n
                https://gl.swmansion.com/rnoh/react-native-harmony/-/merge_requests/${mergeRequestId}`);
            rl.close();
            process.exit(0);
          } else {
            console.log('Deployment aborted.');
            rl.close();
            process.exit(1);
          }
        }
      );
    }
  );
}

/**
 * @returns {Promise<boolean>}
 */
async function isRepositoryPrepared() {
  // const status = await exec('git status --porcelain');
  const branch = (await exec('git branch --show-current')).trim();
  const isUpdated =
    (await exec('git rev-list HEAD...origin/main --count')).trim() === '0';
  return branch === 'main' && isUpdated;
}

/**
 * @param {string} version
 *  @param {string} changelogForCurrentVersion
 */
function updateChangelog(version, changelogForCurrentVersion) {
  let data = fs.readFileSync('../CHANGELOG.md').toString();
  data = data.replace(
    '# Changelog',
    `# Changelog\n\n## v${version}\n ${changelogForCurrentVersion}`
  );
  fs.writeFileSync('../CHANGELOG.md', data);
}

/**
 * @param {string} sourceBranch
 * @param {string} title
 * @returns {Promise<number>}
 */
async function createMergeRequest(sourceBranch, title) {
  try {
    const response = await fetch(
      `${GITLAB_URL}/api/v4/projects/447/merge_requests`,
      {
        method: 'POST',
        headers: {
          'PRIVATE-TOKEN': RNOH_REPO_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_branch: sourceBranch,
          target_branch: 'main',
          title: title,
          squash: false,
          remove_source_branch: true,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(
        `Failed to create merge request: ${response.statusText} ${response.status}`
      );
    }
    const responseData = await response.json();
    return responseData.iid;
  } catch (error) {
    console.error('Error creating merge request:', error);
    throw error;
  }
}

runDeployment();
