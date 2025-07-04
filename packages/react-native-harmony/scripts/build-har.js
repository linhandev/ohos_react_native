// @ts-check
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const { glob } = require("glob");
const pathUtils = require("node:path");

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
    const buildHarCommand = `"${nodePath}" "${hvigorwPath}" --mode module -p product=default -p module=react_native_openharmony@default -p buildMode=debug assembleHar --analyze=false --parallel --incremental --no-daemon`;
    execSync(buildHarCommand, { stdio: "inherit", cwd: "../tester/harmony" });
    fs.copyFileSync(
      "../tester/harmony/react_native_openharmony/build/default/outputs/default/react_native_openharmony.har",
      "./react_native_openharmony.har"
    );
    process.exit(0);
  } catch (error) {
    console.error("Command execution failed:", error);
    process.exit(1);
  }
})();
