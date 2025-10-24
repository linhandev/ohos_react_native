// Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
// Use of this source code is governed by a MIT license that can be
// found in the LICENSE file.

import notificationManager from "@ohos.notificationManager";
import { RNPushNotificationIOS as GENERATED } from "../../generated/turboModules/RNPushNotificationIOS";

type NotificationItem = {
  /**
   * identifier of the notification.
   * Required in order to retrieve specific notification.
   */
  id: number;
  /**
   * A short description of the reason for the alert.
   */
  title: string;
  /**
   * The message displayed in the notification alert.
   */
  body: string;
  /**
   * Optional data to be added to the notification
   */
  userInfo?: any;
};

export function getNotificationRequest(
  request: GENERATED.NotificationRequest
): Promise<notificationManager.NotificationRequest> {
  return new Promise((resolve, reject) => {
    try {
      const parsedRequest = parseRequest(request);
      resolve(parsedRequest);
    } catch (err) {
      reject(err);
    }
  });
}

export function getNotificationItems(
  items: notificationManager.NotificationRequest[]
): NotificationItem[] {
  return items.reduce((acc, item) => {
    const content = item.content.multiLine ?? item.content.normal;
    acc.push({
      id: item.id,
      title: content?.title,
      body: content?.text,
      userInfo: item.extraInfo,
    });
    return acc;
  }, [] as NotificationItem[]);
}

type ParsedRequest = {
  id?: number;
  title?: string;
  subtitle?: string;
  body?: string;
  deliverTime?: number;
  badge?: number;
  localContent?: notificationManager.NotificationContent;
  slotType?: notificationManager.SlotType;
  notificationRequest?: notificationManager.NotificationRequest;
  extraInfo: { [key: string]: any };
};

function parseRequest(
  request: GENERATED.NotificationRequest
): notificationManager.NotificationRequest {
  const parsedRequest: ParsedRequest = {
    extraInfo: {},
  };

  if (!isNullOrUndefined(request.title) && !isNullOrUndefined(request.body)) {
    parsedRequest.title = request.title;
    parsedRequest.title = request.body;
  } else {
    throw new Error("The parameter cannot be null or undefined");
  }

  if (request.subtitle) {
    parsedRequest.subtitle = request.subtitle;
  }
  parsedRequest.localContent = getNotificationContent(parsedRequest);
  parsedRequest.notificationRequest = { content: parsedRequest.localContent };

  if (!isNullOrUndefined(request.id)) {
    parsedRequest.id = parsePositiveInteger(request.id);
    parsedRequest.notificationRequest = {
      ...parsedRequest.notificationRequest,
      id: parsedRequest.id,
    };
  }

  if (!isNullOrUndefined(request.fireDate)) {
    const date = new Date(request.fireDate!);
    parsedRequest.deliverTime = date.getTime();
    parsedRequest.notificationRequest = {
      ...parsedRequest.notificationRequest,
      deliveryTime: parsedRequest.deliverTime,
    };
  }

  if (!isNullOrUndefined(request.badge)) {
    parsedRequest.badge = request.badge;
    parsedRequest.notificationRequest = {
      ...parsedRequest.notificationRequest,
      badgeNumber: parsedRequest.badge,
    };
  }

  if (!isNullOrUndefined(request.userInfo)) {
    convertUserInfo(request.userInfo!, parsedRequest.extraInfo);
    parsedRequest.notificationRequest = {
      ...parsedRequest.notificationRequest,
      extraInfo: parsedRequest.extraInfo,
    };
  }

  if (!isNullOrUndefined(request.isSilent)) {
    if (request.isSilent) {
      parsedRequest.slotType = notificationManager.SlotType.CONTENT_INFORMATION;
      parsedRequest.notificationRequest = {
        ...parsedRequest.notificationRequest,
        notificationSlotType: parsedRequest.slotType,
      };
    } else {
      parsedRequest.slotType =
        notificationManager.SlotType.SOCIAL_COMMUNICATION;
      parsedRequest.notificationRequest = {
        ...parsedRequest.notificationRequest,
        notificationSlotType: parsedRequest.slotType,
      };
    }
  } else {
    parsedRequest.slotType = notificationManager.SlotType.SERVICE_INFORMATION;
    parsedRequest.notificationRequest = {
      ...parsedRequest.notificationRequest,
      notificationSlotType: parsedRequest.slotType,
    };
  }

  if (!isNullOrUndefined(request.repeats)) {
    parsedRequest.notificationRequest = {
      ...parsedRequest.notificationRequest,
      isAlertOnce: !request.repeats,
    };
  }

  return parsedRequest.notificationRequest;
}

function isNullOrUndefined(value: any): boolean {
  return value === null || value === undefined || value === "";
}

function stringToAsciiArray(str: string): number[] {
  return str.split("").map((char) => char.charCodeAt(0));
}

function parsePositiveInteger(str: string): number {
  let num = parseInt(str);
  if (!isNaN(num) && num > 0 && num.toString() === str) {
    return num;
  }
  let asciiCodes = stringToAsciiArray(str);
  num = asciiCodes.length + asciiCodes[0] + asciiCodes[asciiCodes.length - 1];
  return num;
}

function convertUserInfo(obj: object, extraInfo: { [key: string]: any }) {
  Object.keys(obj).forEach((key) => {
    extraInfo[key] = String(obj[key]);
  });
}

function getNotificationContent(
  parsedRequest: ParsedRequest
): notificationManager.NotificationContent {
  if (parsedRequest.subtitle) {
    return {
      notificationContentType:
        notificationManager.ContentType.NOTIFICATION_CONTENT_MULTILINE,
      multiLine: {
        title: parsedRequest.title,
        text: parsedRequest.body,
        briefText: parsedRequest.subtitle,
        longTitle: parsedRequest.title,
        lines: [parsedRequest.subtitle, parsedRequest.body],
      },
    };
  } else {
    return {
      notificationContentType:
        notificationManager.ContentType.NOTIFICATION_CONTENT_BASIC_TEXT,
      normal: {
        title: parsedRequest.title,
        text: parsedRequest.body,
      },
    };
  }
}
