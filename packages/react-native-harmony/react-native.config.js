let harmony;
try {
  harmony = require('@react-native-oh/react-native-harmony-cli');
} catch (err) {
  if (typeof err === 'object' && err?.code === 'MODULE_NOT_FOUND') {
    console.warn(
      'react-native-harmony is installed but @react-native-oh/react-native-harmony-cli is not. "*-harmony" commands are unavailable. Please install @react-native-oh/react-native-harmony-cli in your project. This change was introduced in React native 0.76.\n'
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
