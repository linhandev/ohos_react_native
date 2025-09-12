// @ts-check
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const fse = require('fs-extra');
const { glob } = require("glob");
const pathUtils = require("node:path");

const HARMONY_PATH = '../tester/harmony';
const RNOH_PATH = `${HARMONY_PATH}/react_native_openharmony`;
const MAIN_PATH = `${RNOH_PATH}/src/main`;

/**
 * @param {string} directory
 * @param {string} filename
 */
async function findFirstFile(directory, filename) {
  try {
    const files = await glob(`${directory}/**/${filename}`, { nodir: true });
    return files.length > 0 ? files[0] : null;
  } catch (err) {
    console.error(`Error searching for ${filename}: ${err}`);
    return null;
  }
}

/**
 * Filters files in a specified directory based on their extensions.
 * @param {string} dir
 * @param {string[]} exts e.g., ['h', 'hpp']
 * @param {string} target
 */
function filterFileByExt(dir, exts = [], target) {
  const files = fs.readdirSync(dir);
  for (let i = 0, len = files.length; i < len; i++) {
    const item = files[i];
    const stat = fs.lstatSync(`${dir}/${item}`);
    if (stat.isDirectory()) {
      filterFileByExt(`${dir}/${item}`, exts, `${target}/${item}`);
      continue;
    }
    exts = exts.map(ext => ext.trim().toLowerCase());
    const ext = item.split('.').pop()?.toLowerCase();
    if (ext && exts.includes(ext)) {
      const source = `${dir}/${item}`;
      const dest = `${target}/${item}`;
      try {
        fse.copySync(source, dest);
      } catch (err) {
        console.error(`[failed!]: copy ${source} -> ${dest}\n\n${err}`);
      }
    }
  }
}

function prepareBuildHar() {
  // [1] Replace build-profile.
  fse.copySync('./scripts/resources/build-profile_project.json5', `${HARMONY_PATH}/build-profile.json5`);
  fse.copySync('./scripts/resources/build-profile_module.json5', `${RNOH_PATH}/build-profile.json5`);
  // [2] Extract all header files.
  filterFileByExt(`${MAIN_PATH}/cpp`, ['h', 'hpp', 'ipp'], `${MAIN_PATH}/include`);
  // [3] Copy other files.
  fse.copySync(
    `${MAIN_PATH}/cpp/third-party/folly/CMake/folly-config.h.cmake`,
    `${MAIN_PATH}/include/third-party/folly/CMake/folly-config.h.cmake`
  );
  fse.copySync(`./scripts/resources/react-native-harmony.cmake`, `${MAIN_PATH}/include/react-native-harmony.cmake`);
  ['logging.h', 'raw_logging.h', 'stl_logging.h', 'vlog_is_on.h'].forEach(filePath => {
    try {
      fse.copySync(
        `${HARMONY_PATH}/entry/.cxx/default/default/debug/arm64-v8a/rn/third-party/glog/glog/${filePath}`,
        `${MAIN_PATH}/include/third-party/glog/src/glog/${filePath}`
      );
    } catch (err) {
      console.error(
        `[failed!]: copy ${HARMONY_PATH}/entry/.cxx/default/default/debug/arm64-v8a/rn/third-party/glog/glog/${filePath}\n\n${err}`
      );
    }
  });
  // [4] Copy RNOHAppNapiBridge.cpp
  fse.copySync(`${MAIN_PATH}/cpp/RNOHAppNapiBridge.cpp`, `${MAIN_PATH}/include/RNOHAppNapiBridge.cpp`);
}

(async () => {
  const DEVECO_SDK_HOME = process.env.DEVECO_SDK_HOME;

  if (!DEVECO_SDK_HOME) {
    console.error("DEVECO_SDK_HOME is undefined");
    process.exit(1);
  }

  const basePath = pathUtils.join(DEVECO_SDK_HOME, "..");
  const nodePath = await findFirstFile(
    basePath,
    "node" + (process.platform === "win32" ? ".exe" : "")
  );
  const hvigorwPath = await findFirstFile(basePath, "hvigorw.js");

  try {
    prepareBuildHar();
    // build source har
    const buildSourceHarCommand = `"${nodePath}" "${hvigorwPath}" --mode module -p product=default -p module=react_native_openharmony@default -p buildMode=debug assembleHar --analyze=false --parallel --incremental --no-daemon`;
    execSync(buildSourceHarCommand, { stdio: "inherit", cwd: HARMONY_PATH });
    fs.copyFileSync(
      `${RNOH_PATH}/build/default/outputs/default/react_native_openharmony.har`,
      "./react_native_openharmony.har"
    );
    // clean build directory
    const cleanBuildCommand = `"${nodePath}" "${hvigorwPath}" clean --mode module -p module=react_native_openharmony`;
    execSync(cleanBuildCommand, { stdio: "inherit", cwd: HARMONY_PATH });
    // build release har
    const buildReleaseHarCommand = `"${nodePath}" "${hvigorwPath}" --mode module -p product=default -p module=react_native_openharmony@default -p buildMode=release -p debuggable=false assembleHar --analyze=false --parallel --incremental --no-daemon`;
    execSync(buildReleaseHarCommand, { stdio: "inherit", cwd: HARMONY_PATH });
    fs.copyFileSync(
      `${RNOH_PATH}/build/default/outputs/default/react_native_openharmony.har`,
      "./react_native_openharmony_release.har"
    );
    // clean build directory
    execSync(cleanBuildCommand, { stdio: "inherit", cwd: HARMONY_PATH });
    // build bytecode har
    const buildByteCodeHarCommand = `"${nodePath}" "${hvigorwPath}" --mode module -p product=release2 -p module=react_native_openharmony@default -p buildMode=release -p debuggable=false assembleHar --analyze=false --parallel --incremental --no-daemon`;
    execSync(buildByteCodeHarCommand, { stdio: "inherit", cwd: HARMONY_PATH });
    fs.copyFileSync(
      `${RNOH_PATH}/build/release2/outputs/default/react_native_openharmony.har`,
      "./react_native_openharmony_release2.har"
    );
    process.exit(0);
  } catch (error) {
    console.error("Command execution failed:", error);
    process.exit(1);
  }
})();
