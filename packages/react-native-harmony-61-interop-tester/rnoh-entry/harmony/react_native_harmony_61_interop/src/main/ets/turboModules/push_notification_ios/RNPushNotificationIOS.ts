// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
// Use of this source code is governed by a MIT license that can be
// found in the LICENSE file.

import {
  UITurboModule,
  UITurboModuleContext,
} from "@rnoh/react-native-openharmony/ts";
import notificationManager from "@ohos.notificationManager";
import { BusinessError } from "@kit.BasicServicesKit";
import {
  getNotificationRequest,
  getNotificationItems,
} from "./NotificationUtils";
import { RNPushNotificationIOS as GENERATED } from "../../generated/turboModules/RNPushNotificationIOS";

export class RNPushNotificationIOS
  extends UITurboModule
  implements GENERATED.Spec
{
  static NAME = GENERATED.NAME;

  constructor(ctx: UITurboModuleContext) {
    super(ctx);
  }

  addNotificationRequest(request: GENERATED.NotificationRequest) {
    getNotificationRequest(request).then((data) => {
      if (data) {
        notificationManager.publish(data, (err) => {
          if (err) {
            console.error(
              `RNPushNotificationIOS: publish failed, code is ${err.code}, message is ${err.message}`
            );
          }
        });
      } else {
        console.error("RNPushNotificationIOS: publish failed");
      }
    });
  }

  removeDeliveredNotifications(identifiers: string[]) {
    for (let i = 0; i < identifiers.length; i++) {
      let data = identifiers[i];
      let id = parseInt(data);

      notificationManager.cancel(id, (err) => {
        console.error(
          `RNPushNotificationIOS: cancel failed, code is ${err.code}, message is ${err.message}`
        );
      });
    }
  }

  removeAllDeliveredNotifications() {
    notificationManager.cancelAll((err) => {
      if (err) {
        console.error(
          `RNPushNotificationIOS: cancelAll failed, code is ${err.code}, message is ${err.message}`
        );
      }
    });
  }

  setApplicationIconBadgeNumber(badgeNumber: number) {
    notificationManager.setBadgeNumber(badgeNumber, (err) => {
      if (err) {
        console.error(
          `RNPushNotificationIOS: setBadge fail: ${JSON.stringify(err)}`
        );
      }
    });
  }

  getDeliveredNotifications(callback: (result: unknown[]) => void) {
    notificationManager.getActiveNotifications().then((data) => {
      let newArray = getNotificationItems(data);
      callback(newArray);
    });
  }

  checkPermissions(
    callback: (permission: {
      alert: boolean;
      badge: boolean;
      sound: boolean;
    }) => void
  ) {
    const isNotificationEnabledCallback = (
      err: BusinessError,
      isEnabled: boolean
    ): void => {
      if (err) {
        console.error(
          `RNPushNotificationIOS: checkPermissions failed, code is ${err.code}, message is ${err.message}`
        );
      } else {
        callback({ alert: isEnabled, badge: isEnabled, sound: isEnabled });
      }
    };

    notificationManager.isNotificationEnabled(isNotificationEnabledCallback);
  }

  addListener(): void {}
  removeListeners(): void {}
}
