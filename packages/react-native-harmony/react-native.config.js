let harmony;
try {
  // TODO: Replace with @react-native-oh/react-native-harmony-cli after moving this code to Gitee
  harmony = require('@rnoh/react-native-harmony-cli');
} catch (err) {
  if (typeof err === 'object' && err?.code === 'MODULE_NOT_FOUND') {
    // TODO: Replace with @react-native-oh/react-native-harmony-cli after moving this code to Gitee
    console.warn(
      'react-native-harmony is installed but @rnoh/react-native-harmony-cli is not. "*-harmony" commands are unavailable. Please install @rnoh/react-native-harmony-cli in your project. This change was introduced in React native 0.76.\n'
    );
  }
  throw err;
}

/**
 * @type {import("@react-native-community/cli-types").Config}
 */
const config = {
  commands: harmony?.config?.commands ?? [],
};

module.exports = config;
