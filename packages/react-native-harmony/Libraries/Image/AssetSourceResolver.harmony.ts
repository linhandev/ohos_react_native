/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { AssetData } from 'metro';
// @ts-ignore
import { getBasePath } from '@react-native/assets-registry/path-support';
import { Dimensions, Platform } from 'react-native';

export type Asset = AssetData;

/**
 * Keep this method in sync with the one use in @rnoh/react-native-harmony-cli/src/AssetResolver.
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

function pickScale(scales: Array<number>, deviceScale?: number): number {
  if (deviceScale == null) {
    deviceScale = Dimensions.get('window').scale;
  }
  // Packager guarantees that `scales` array is sorted
  for (let i = 0; i < scales.length; i++) {
    if (scales[i] >= deviceScale) {
      return scales[i];
    }
  }

  // If nothing matches, device scale is larger than any available
  // scales, so we return the biggest one. Unless the array is empty,
  // in which case we default to 1
  return scales[scales.length - 1] || 1;
}

function getScaledAssetPath(asset: Asset): string {
  const scale = pickScale(asset.scales);
  const scaleSuffix = scale === 1 ? '' : '@' + scale + 'x';
  const assetDir = getBasePath(asset);
  return assetDir + '/' + asset.name + scaleSuffix + '.' + asset.type;
}

type ResolvedAssetSource = {
  readonly __packager_asset: boolean;
  readonly width?: number;
  readonly height?: number;
  readonly uri: string;
  readonly scale: number;
};

class AssetSourceResolver {
  constructor(
    private serverUrl: string | undefined,
    private jsbundleUrl: string | undefined,
    private asset: Asset
  ) {}

  isLoadedFromServer(): boolean {
    return !!this.serverUrl;
  }

  public defaultAsset(): ResolvedAssetSource {
    if (this.isLoadedFromServer()) {
      return this.assetServerURL();
    }

    return {
      __packager_asset: this.asset.__packager_asset,
      uri: `asset://${getAssetDestRelativePath(this.asset)}`,
      scale: 1,
      width: this.asset.width,
      height: this.asset.height,
    };
  }

  /**
   * Returns an absolute URL which can be used to fetch the asset
   * from the devserver
   */
  assetServerURL(): ResolvedAssetSource {
    if (!this.serverUrl) {
      throw new Error('need server to load from');
    }

    return this.fromSource(
      this.serverUrl +
        getScaledAssetPath(this.asset) +
        '?platform=' +
        Platform.OS +
        '&hash=' +
        this.asset.hash
    );
  }

  fromSource(source: string): ResolvedAssetSource {
    return {
      __packager_asset: true,
      width: this.asset.width,
      height: this.asset.height,
      uri: source,
      scale: 1,
    };
  }
}

module.exports = AssetSourceResolver;
