import type { AssetData } from 'metro';

export type Asset = AssetData;

/**
 * Keep this method in sync with the one use in @rnoh/react-native-harmony/Libraries/Image/AssetSourceResolver.harmony.ts.
 * Consider moving this file to its own NPM package if keeping those functions in sync becomes problematic.
 */
export function getAssetDestRelativePath(asset: Asset): string {
  const fileName = getResourceIdentifier(asset);
  return `${fileName}.${asset.type}`;
}

function getResourceIdentifier(asset: Asset): string {
  const folderPath = getBasePath(asset);
  return `${folderPath}/${asset.name}`
    .toLowerCase()
    .replace(/\//g, '_')
    .replace(/([^a-z0-9_])/g, '')
    .replace(/^assets_/, '');
}

function getBasePath(asset: Asset): string {
  let basePath = asset.httpServerLocation;
  if (basePath[0] === '/') {
    basePath = basePath.substr(1);
  }
  return basePath;
}
