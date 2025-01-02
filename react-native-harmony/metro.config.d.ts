import type { InputConfigT } from 'metro-config';

interface HarmonyMetroConfigOptions {
  reactNativeHarmonyPackageName?: string;
}

export function createHarmonyMetroConfig(
  options?: HarmonyMetroConfigOptions
): InputConfigT;
