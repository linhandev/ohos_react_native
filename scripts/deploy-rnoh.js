// @ts-check
const path = require("path");
const { exec: exec_ } = require("child_process");
const fs = require("node:fs");
const readline = require("readline/promises");
const JSON5 = require("json5");

const RNOH_REPO_ID = 447;
const RN_CORE_REPO_ID = 593;
const RNOH_REPO_TOKEN = process.env.RNOH_REPO_TOKEN ?? "";
const RN_CORE_REPO_TOKEN = process.env.RN_CORE_REPO_TOKEN ?? "";

const RNOH_ROOT = `${__dirname}/../`;
const RNOH_PACKAGE_PATH = `${RNOH_ROOT}/packages/react-native-harmony`;
const RN_CORE_PACKAGE_PATH =
  `${RNOH_ROOT}/packages/react-native-core/packages/react-native`;
const RNOH_HVIGOR_PLUGIN_PACKAGE_PATH =
  `${RNOH_ROOT}/packages/react-native-harmony-hvigor-plugin`;
const RNOH_CLI_PACKAGE_PATH = `${RNOH_ROOT}/packages/react-native-harmony-cli`;
const GITLAB_URL = "https://gl.swmansion.com";
const OH_PACKAGE_PATH =
  `${RNOH_ROOT}/packages/tester/harmony/react_native_openharmony/oh-package.json5`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

async function runDeployment() {
  assert(!!RNOH_REPO_TOKEN, "RNOH_REPO_TOKEN not found");
  assert(!!RN_CORE_REPO_TOKEN, "RN_CORE_REPO_TOKEN not found");
  assert(
    fs.existsSync(RN_CORE_PACKAGE_PATH),
    "The react-native-core package is missing from the repository. Initialize the submodules first.",
  );

  const rnohBranch = await getCurrentBranch(RNOH_ROOT);
  const rnCoreBranch = await getCurrentBranch(RN_CORE_PACKAGE_PATH);
  assert(
    rnCoreBranch !== "",
    "The react-native-core repository must be checked out to a specific branch.",
  );

  console.log("#####################################################");
  console.log("Current branch for react-native-harmony: " + rnohBranch);
  console.log("Current branch for react-native-core: " + rnCoreBranch);
  await askUserToContinueOrAbort();

  assert(
    await isRepositoryPrepared(".", rnohBranch),
    "react-native-harmony branch should be up to date with upstream.",
  );

  assert(
    await isRepositoryPrepared(RN_CORE_PACKAGE_PATH, rnCoreBranch),
    "react-native-core branch should be up to date with upstream.",
  );

  const packageDirs = [
    RN_CORE_PACKAGE_PATH,
    RNOH_HVIGOR_PLUGIN_PACKAGE_PATH,
    RNOH_CLI_PACKAGE_PATH,
    RNOH_PACKAGE_PATH,
  ];

  console.log("");
  console.log("#####################################################");
  console.log("Current package versions: ");
  for (const packageDir of packageDirs) {
    const packageJson = readPackage(packageDir);
    console.log(packageJson["name"] + " : " + packageJson["version"]);
  }

  const version = await askUserForVersion();
  for (const packageDir of packageDirs) {
    setPackageVersion(packageDir, version);
  }
  setOHPackageVersion(OH_PACKAGE_PATH, version);

  // generate changelog
  const changelogForCurrentVersion = await exec(`pnpm gen:changelog`);
  updateChangelog(
    version,
    changelogForCurrentVersion.split("\n").slice(4).join("\n"),
  );

  //build har for react-native-harmony
  await exec("pnpm build:har", RNOH_PACKAGE_PATH);

  // update locks and verify version
  await exec(`pnpm i`);
  await exec("pnpm verify");

  console.log("");
  console.log("#####################################################");
  console.log(
    "Ensure you complete the following steps before proceeding with deployment.",
  );
  console.log("1. Build and run ./packages/tester and verify the changes.");
  console.log(
    "2. Build and run ./packages/tester-ecosystem and verify the changes.",
  );
  console.log("3. Verify ./CHANGELOG.md and modify it if needed.");

  await askUserToContinueOrAbort();

  // await publishPackage(RN_CORE_PACKAGE_PATH);
  await prepareMergeRequestAndAwaitForMerging(
    "react-native-core",
    RN_CORE_PACKAGE_PATH,
    version,
    RN_CORE_REPO_TOKEN,
    RN_CORE_REPO_ID,
    rnCoreBranch,
  );

  // update submodules after changes to upstream react-native-core
  await exec(`git submodule update --recursive --remote`);

  await publishPackage(RNOH_CLI_PACKAGE_PATH);
  await publishPackage(RNOH_PACKAGE_PATH);

  await prepareMergeRequestAndAwaitForMerging(
    "react-native-harmony",
    ".",
    version,
    RNOH_REPO_TOKEN,
    RNOH_REPO_ID,
    rnohBranch,
  );

  console.log("Deployment finished successfully.");
  process.exit(0);
}

async function askUserToContinueOrAbort() {
  while (true) {
    const ans = await rl.question("Should deployment be continued? (yes/no): ");
    if (ans === "yes") {
      return;
    }

    if (ans === "no") {
      abortDeployment();
    }
  }
}

/**
 * @param {string} packagePath
 * @returns {Promise<string>}
 */
async function publishPackage(packagePath) {
  return exec("pnpm publish --no-git-checks", packagePath);
}

/**
 * @param {string} repoPath
 * @returns {Promise<string>}
 */
async function getCurrentBranch(repoPath) {
  return (await exec("git branch --show-current", repoPath)).trim();
}

/**
 * @param {string} repoPath
 * @param {string} branch
 * @returns {Promise<boolean>}
 */
async function isRepositoryPrepared(repoPath, branch) {
  const isUpdated =
    (
      await exec(`git rev-list HEAD...origin/${branch}  --count`, repoPath)
    ).trim() === "0";
  return isUpdated;
}

/**
 * @returns {Promise<string>}
 */
async function askUserForVersion() {
  return rl.question(`Enter new RNOH version: `);
}

function abortDeployment() {
  console.log("Deployment aborted.");
  process.exit(1);
}

/**
 * @param {string} packageDir
 * @returns {{version: string, scripts?: Record<string, string>}}
 */
function readPackage(packageDir) {
  const packageJsonPath = path.join(packageDir, "package.json");
  const packageContent = fs.readFileSync(packageJsonPath, "utf-8");
  return JSON.parse(packageContent);
}

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
 * @param {string} [cwd]
 * @returns {Promise<string>}
 */
async function exec(command, cwd) {
  return new Promise((resolve, reject) => {
    const child = exec_(command, { cwd });

    let output = "";
    child.stdout?.on("data", (data) => {
      process.stdout.write(data);
      output += data;
    });

    child.stderr?.on("data", (data) => {
      process.stderr.write(data);
      output += data;
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

/**
 * @param {string} packageDir
 * @param {string} version
 */

function setPackageVersion(packageDir, version) {
  const packageData = readPackage(packageDir);
  packageData.version = version;

  const packageJsonPath = path.join(packageDir, "package.json");
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageData, null, 2),
    "utf-8",
  );
}

/**
 * @param {string} ohPackagePath
 * @param {string} version
 */
function setOHPackageVersion(ohPackagePath, version) {
  const ohPackageContent = JSON5.parse(
    fs.readFileSync(ohPackagePath).toString(),
  );
  ohPackageContent.version = version;
  fs.writeFileSync(ohPackagePath, JSON5.stringify(ohPackageContent, null, 2));
}

/**
 * @param {string} version
 * @param {string} changelogForCurrentVersion
 */
function updateChangelog(version, changelogForCurrentVersion) {
  let data = fs.readFileSync(`${RNOH_ROOT}/CHANGELOG.md`).toString();
  data = data.replace(
    "# Changelog",
    `# Changelog\n\n## v${version}\n ${changelogForCurrentVersion}`,
  );
  fs.writeFileSync(`${RNOH_ROOT}/CHANGELOG.md`, data);
}

/**
 * @param {string} repoName
 * @param {string} repoDir
 * @param {string} version
 * @param {string} token
 * @param {number} repoId
 * @param {string} targetBranch
 * @returns {Promise<number>}
 */
async function prepareMergeRequestAndAwaitForMerging(
  repoName,
  repoDir,
  version,
  token,
  repoId,
  targetBranch,
) {
  const branchName = `release-${repoName}-${version}`;
  const title = `release: ${repoName}@${version}`;
  await exec(`git checkout -b ${branchName}`, repoDir);
  await exec("git add -A", repoDir);
  await exec(`git commit -m "${title}"`, repoDir);
  await exec(`git push -u origin HEAD --no-verify`, repoDir);

  await exec(`git tag v${version}`, repoDir);
  await exec(`git push -u origin v${version} --no-verify`, repoDir);
  const mergeRequestId = await createMergeRequest(
    branchName,
    targetBranch,
    title,
    token,
    repoId,
  );

  console.log(`Make sure that MR is merged before continuing:\n
          https://gl.swmansion.com/rnoh/${repoName}/-/merge_requests/${mergeRequestId}`);

  await askUserToContinueOrAbort();

  // go back to the initial branch, pull changes
  await exec(`git checkout ${targetBranch}`, repoDir);
  await exec(`git pull`, repoDir);
  return 0;
}

/**
 * @param {string} sourceBranch
 * @param {string} targetBranch
 * @param {string} title
 * @param {string} token
 * @param {number} repoId
 * @returns {Promise<number>}
 */
async function createMergeRequest(
  sourceBranch,
  targetBranch,
  title,
  token,
  repoId,
) {
  try {
    const response = await fetch(
      `${GITLAB_URL}/api/v4/projects/${repoId}/merge_requests`,
      {
        method: "POST",
        headers: {
          "PRIVATE-TOKEN": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_branch: sourceBranch,
          target_branch: targetBranch,
          title: title,
          squash: false,
          remove_source_branch: true,
        }),
      },
    );
    if (!response.ok) {
      throw new Error(
        `Failed to create merge request: ${response.statusText} ${response.status}`,
      );
    }
    const responseData = await response.json();
    return responseData.iid;
  } catch (error) {
    console.error("Error creating merge request:", error);
    throw error;
  }
}

runDeployment();
