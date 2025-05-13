const pathUtils = require('node:path');

let commands = [];
try {
  const harmony = require('@react-native-oh/react-native-harmony-cli');
  commands = harmony?.config?.commands;
} catch (err) {
  if (typeof err === 'object' && err?.code === 'MODULE_NOT_FOUND') {
    console.warn(
      'react-native-harmony is installed but @react-native-oh/react-native-harmony-cli is not. "*-harmony" commands are unavailable. Please install @react-native-oh/react-native-harmony-cli in your project. This change was introduced in React native 0.76.\n'
    );
  }
}

/**
 * Package name shouldn't be hardcoded because this package can be installed under an alias.
 */
const rnohNpmPackageName =
  deriveFullNpmPackageNameFromDirname(__dirname) ??
  '@react-native-oh/react-native-harmony';

/**
 * @type {import("@react-native-community/cli-types").Config}
 */
const config = {
  commands,
  platforms: {
    harmony: {
      npmPackageName: rnohNpmPackageName,
      projectConfig: () => ({}),
      dependencyConfig: () => ({}),
    },
  },
};

module.exports = config;

/**
 * @param {string} dirname
 * @return {string | null}
 */
function deriveFullNpmPackageNameFromDirname(dirname) {
  const pathSegments = dirname.split(pathUtils.sep);
  if (pathSegments.includes('node_modules')) {
    /**
     * Production environment
     */
    const nodeModulesIndex = pathSegments.indexOf('node_modules');
    const organizationNameMaybeAndPackageName = pathSegments.slice(
      nodeModulesIndex + 1
    );
    if (organizationNameMaybeAndPackageName.length === 1) {
      return organizationNameMaybeAndPackageName[0]; // packageName
    }
    if (organizationNameMaybeAndPackageName.length === 2) {
      return organizationNameMaybeAndPackageName.join('/');
    }
    return null;
  } else {
    /**
     * RNOH development environment
     */
    return null;
  }
}
