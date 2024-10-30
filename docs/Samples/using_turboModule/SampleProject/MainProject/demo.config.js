const {mergeConfig, getDefaultConfig} = require('@react-native/metro-config');
const {createHarmonyMetroConfig} = require('react-native-harmony/metro.config');

module.exports = mergeConfig(getDefaultConfig(__dirname), createHarmonyMetroConfig({
    reactNativeHarmonyPackageName: 'react-native-harmony',
}));