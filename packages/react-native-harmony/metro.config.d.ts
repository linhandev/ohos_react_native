import type { InputConfigT } from '@react-native/metro-config';

interface HarmonyMetroConfigOptions {
  reactNativeHarmonyPackageName?: string;
  /**
   * @internal
   */
  __reactNativeHarmonyPattern?: string;
  /**
   * @internal
   */
  __reactNativeInteropLibraryPackagePattern?: string;
}

export function createHarmonyMetroConfig(
  options?: HarmonyMetroConfigOptions
): InputConfigT;
