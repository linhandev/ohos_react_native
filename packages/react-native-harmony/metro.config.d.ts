import type { InputConfigT } from '@react-native/metro-config';

interface HarmonyMetroConfigOptions {
  reactNativeHarmonyPackageName?: string;
}

export function createHarmonyMetroConfig(
  options?: HarmonyMetroConfigOptions
): InputConfigT;
