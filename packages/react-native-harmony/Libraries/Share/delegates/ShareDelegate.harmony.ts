/**
 * Copyright (c) 2024 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import invariant from 'invariant';
import {
  BaseShareDelegate,
  ShareAction,
  ShareContent,
  ShareOptions,
} from './BaseShareDelegate';
// @ts-ignore
import NativeShareModule from '../NativeShareModule';

export default class ShareDelegate extends BaseShareDelegate {
  override async onShare(
    content: ShareContent,
    options: ShareOptions
  ): Promise<ShareAction> {
    invariant(NativeShareModule, 'ShareModule should be registered.');
    invariant(
      typeof content.url === 'string' ||
        typeof content.message === 'string' ||
        typeof content.title === 'string',
      'At least one of URL, title and message is required'
    );
    const newContent = {
      title: content.title,
      message:
        typeof content.message === 'string' ? content.message : undefined,
      url: typeof content.url === 'string' ? content.url : undefined,
    };
    const result = await NativeShareModule.share(
      newContent,
      options.dialogTitle
    );
    return { activityType: null, ...result };
  }
}
