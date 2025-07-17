import type { AssetData } from 'metro';

export type Asset = AssetData;

/**
 * Keep this method in sync with the one use in @rnoh/react-native-harmony/Libraries/Image/AssetSourceResolver.harmony.ts.
 * Consider moving this file to its own NPM package if keeping those functions in sync becomes problematic.
 */
export function getAssetDestRelativePath(asset: Asset): string {
  const fileName = getResourceIdentifier(asset);
  // Assets can have relative paths outside of the project root.
  // Replace `../` with `_` to make sure they don't end up outside of
  // the expected assets directory.
  return `${fileName}.${asset.type}`.replace(/\.\.\//g, '_');
}

function getResourceIdentifier(asset: Asset): string {
  const folderPath = getBasePath(asset);
  return `${folderPath}/${asset.name}`.replace(/^assets\//, '');
}

function getBasePath(asset: Asset): string {
  const basePath = asset.httpServerLocation;
  return basePath.startsWith('/') ? basePath.slice(1) : basePath;
}
