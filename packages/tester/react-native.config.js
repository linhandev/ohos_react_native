module.exports = {
  reactNativePath: process.env.RNOH_TESTER_ONLY__TARGET_PLATFORM === 'harmony' ? '../react-native-core/packages/react-native' : undefined,
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/'],
};
