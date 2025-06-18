/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE-MIT file in the root directory of this source tree.
 */

import type { AssetData } from 'metro';

export type Asset = AssetData;

export function getAssetDestRelativePath(asset: Asset): string {
  const fileName = getResourceIdentifier(asset);
  return `${fileName}.${asset.type}`;
}

function getResourceIdentifier(asset: Asset): string {
  const folderPath = getBasePath(asset);
  return `${folderPath}/${asset.name}`.slice('assets/'.length);
}

function getBasePath(asset: Asset): string {
  let basePath = asset.httpServerLocation;
  if (basePath[0] === '/') {
    basePath = basePath.substr(1);
  }
  // Assets can have relative paths outside of the project root.
  // Replace `../` with `_` to make sure they don't end up outside of
  // the expected assets directory.
  basePath = basePath.replace(/\.\.\//g, '_');
  return basePath;
}
