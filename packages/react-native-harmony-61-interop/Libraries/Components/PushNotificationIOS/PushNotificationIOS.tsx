/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */
/**
 * NOTICE: This file is copied from @react-native-ohos/push-notification-ios and adapted.
 *
 * PushNotificationIOS-ios was initially part of the RN hence such copyright header is used.
 * This component was later extracted and moved to a separate library.
 * The copyright header above is also used in the react-native-community version, but the community version is converted to TypeScript.
 * @react-native-ohos/push-notification-ios is based on from react-native-community and slightly adapted for OHOS.
 */

"use strict";

import { NativeEventEmitter } from "react-native";
import invariant from "invariant";
import type {
  NotificationAlert,
  NotificationRequest,
  NotificationCategory,
} from "../../../src/private/specs/PushNotificationIOS";
import RNCPushNotificationIOS from "../../../src/private/specs/PushNotificationIOS";

const PushNotificationEmitter = new NativeEventEmitter(RNCPushNotificationIOS);

const _notifHandlers = new Map();

const DEVICE_NOTIF_EVENT = "remoteNotificationReceived";
const NOTIF_REGISTER_EVENT = "remoteNotificationsRegistered";
const NOTIF_REGISTRATION_ERRorOR_EVENT = "remoteNotificationRegistrationError";
const DEVICE_LOCAL_NOTIF_EVENT = "localNotificationReceived";

export type ContentAvailable = 1 | null | void;

class PushNotificationIOS {
  _data: Record<string, any>;
  _alert?: string | NotificationAlert;
  _title?: string;
  _subtitle?: string;
  _sound?: string;
  _category?: string;
  _contentAvailable?: ContentAvailable;
  _badgeCount?: number;
  _notificationId?: string;
  /**
   * The id of action the user has taken taken.
   */
  _actionIdentifier: string | undefined;
  /**
   * The text user has input if user responded with a text action.
   */
  _userText: string | undefined;
  _isRemote: boolean;
  _remoteNotificationCompleteCallbackCalled: boolean;
  _threadID?: string;
  _fireDate?: string | Date;

  /**
   * You will never need to instantiate `PushNotificationIOS` yourself.
   * Listening to the `notification` event and invoking
   * `getInitialNotification` is sufficient
   *
   */
  constructor(nativeNotif: any) {
    this._data = {};
    this._remoteNotificationCompleteCallbackCalled = false;
    this._isRemote = nativeNotif.remote;
    if (this._isRemote) {
      this._notificationId = nativeNotif.notificationId;
    }

    this._actionIdentifier = nativeNotif.actionIdentifier;
    this._userText = nativeNotif.userText;
    if (nativeNotif.remote) {
      // Extract data from Apple's `aps` dict as defined:
      // https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/ApplePushService.html
      Object.keys(nativeNotif).forEach((notifKey) => {
        const notifVal = nativeNotif[notifKey];

        if (notifKey === "aps") {
          this._alert = notifVal.alert;
          this._title = notifVal?.alertTitle;
          this._subtitle = notifVal?.subtitle;
          this._sound = notifVal.sound;
          this._badgeCount = notifVal.badge;
          this._category = notifVal.category;
          this._contentAvailable = notifVal["content-available"];
          this._threadID = notifVal["thread-id"];
          this._fireDate = notifVal.fireDate;
        } else {
          this._data[notifKey] = notifVal;
        }
      });
    } else {
      // Local notifications aren't being sent down with `aps` dict.
      // TODO: remove applicationIconBadgeNumber on next major version
      this._badgeCount =
        nativeNotif.badge || nativeNotif.applicationIconBadgeNumber;
      // TODO: remove soundName on next major version
      this._sound = nativeNotif.sound || nativeNotif.soundName;
      this._alert = nativeNotif.body;
      this._title = nativeNotif?.title;
      this._subtitle = nativeNotif?.subtitle;
      this._threadID = nativeNotif["thread-id"];
      this._data = nativeNotif.userInfo;
      this._category = nativeNotif.category;
      this._fireDate = nativeNotif.fireDate;
    }
  }

  /**
   * This method is available for remote notifications that have been received via:
   * `application:didReceiveRemoteNotification:fetchCompletionHandler:`
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#finish
   */
  finish(fetchResult: string) {
    if (
      !this._isRemote ||
      !this._notificationId ||
      this._remoteNotificationCompleteCallbackCalled
    ) {
      return;
    }
    this._remoteNotificationCompleteCallbackCalled = true;

    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );

    console.error("PushNotificationIOS.finish is not implmented");
  }

  /**
   * An alias for `getAlert` to get the notification's main message string
   */
  getMessage(): string | object | undefined {
    if (typeof this._alert === "object") {
      return this._alert?.body;
    }
    return this._alert;
  }

  /**
   * Gets the sound string from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getsound
   */
  getSound(): string | undefined {
    return this._sound;
  }

  /**
   * Gets the category string from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getcategory
   */
  getCategory(): string | undefined {
    return this._category;
  }

  /**
   * Gets the notification's main message from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getalert
   */
  getAlert(): string | object | undefined {
    return this._alert;
  }

  /**
   * Gets the notification's title from the `aps` object
   *
   */
  getTitle(): string | object | undefined {
    if (typeof this._alert === "object") {
      return this._alert?.title;
    }
    return this._title;
  }

  /**
   * Gets the notification's subtitle from the `aps` object
   *
   */
  getSubtitle(): string | object | undefined {
    if (typeof this._alert === "object") {
      return this._alert?.subtitle;
    }
    return this._subtitle;
  }

  /**
   * Gets the content-available number from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getcontentavailable
   */
  getContentAvailable(): ContentAvailable {
    return this._contentAvailable;
  }

  /**
   * Gets the badge count number from the `aps` object
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getbadgecount
   */
  getBadgeCount(): number | undefined {
    return this._badgeCount;
  }

  /**
   * Gets the data object on the notif
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getdata
   */
  getData(): object | undefined {
    return this._data;
  }

  /**
   * Gets the thread ID on the notif
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getthreadid
   */
  getThreadID(): string | undefined {
    return this._threadID;
  }

  /**
   * Get's the action id of the notification action user has taken.
   */
  getActionIdentifier(): string | undefined {
    return this._actionIdentifier;
  }

  /**
   * Gets the text user has inputed if user has taken the text action response.
   */
  getUserText(): string | undefined {
    return this._userText;
  }
}

/**
 *
 * Handle push notifications for your app, including permission handling and
 * icon badge number.
 *
 * See https://reactnative.dev/docs/pushnotificationios.html
 */
export default {
  /**
   * Sends notificationRequest to notification center at specified firedate.
   * Fires immediately if firedate is not set.
   */
  addNotificationRequest(request: NotificationRequest) {
    const finalRequest = {
      ...request,
      repeatsComponent: request.repeatsComponent || {},
    };

    RNCPushNotificationIOS.addNotificationRequest(finalRequest);
  },

  /**
   * Remove all delivered notifications from Notification Center.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#removealldeliverednotifications
   */
  removeAllDeliveredNotifications() {
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    RNCPushNotificationIOS.removeAllDeliveredNotifications();
  },

  /**
   * Provides you with a list of the app’s notifications that are still displayed in Notification Center.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getdeliverednotifications
   */
  getDeliveredNotifications(callback: (notifications: Object[]) => void) {
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    RNCPushNotificationIOS.getDeliveredNotifications(callback);
  },

  /**
   * Removes the specified notifications from Notification Center
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#removedeliverednotifications
   */
  removeDeliveredNotifications(identifiers: string[]) {
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    RNCPushNotificationIOS.removeDeliveredNotifications(identifiers);
  },

  /**
   * Sets the badge number for the app icon on the home screen.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#setapplicationiconbadgenumber
   */
  setApplicationIconBadgeNumber(number: number) {
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    RNCPushNotificationIOS.setApplicationIconBadgeNumber(number);
  },

  /**
   * Attaches a listener to remote or local notification events while the app
   * is running in the foreground or the background.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#addeventlistener
   */
  addEventListener(type: any, handler: Function) {
    invariant(
      type === "notification" ||
        type === "register" ||
        type === "registrationError" ||
        type === "localNotification",
      "PushNotificationIOS only supports `notification`, `register`, `registrationError`, and `localNotification` events"
    );
    let listener;
    if (type === "notification") {
      listener = PushNotificationEmitter.addListener(
        DEVICE_NOTIF_EVENT,
        (notifData) => {
          handler(new PushNotificationIOS(notifData));
        }
      );
    } else if (type === "localNotification") {
      listener = PushNotificationEmitter.addListener(
        DEVICE_LOCAL_NOTIF_EVENT,
        (notifData) => {
          handler(new PushNotificationIOS(notifData));
        }
      );
    } else if (type === "register") {
      listener = PushNotificationEmitter.addListener(
        NOTIF_REGISTER_EVENT,
        (registrationInfo) => {
          handler(registrationInfo.deviceToken);
        }
      );
    } else if (type === "registrationError") {
      listener = PushNotificationEmitter.addListener(
        NOTIF_REGISTRATION_ERRorOR_EVENT,
        (errorInfo) => {
          handler(errorInfo);
        }
      );
    }
    _notifHandlers.set(type, listener);
  },

  /**
   * Removes the event listener. Do this in `componentWillUnmount` to prevent
   * memory leaks.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#removeeventlistener
   */
  removeEventListener(type: any) {
    invariant(
      type === "notification" ||
        type === "register" ||
        type === "registrationError" ||
        type === "localNotification",
      "PushNotificationIOS only supports `notification`, `register`, `registrationError`, and `localNotification` events"
    );
    const listener = _notifHandlers.get(type);
    if (!listener) {
      return;
    }
    listener.remove();
    _notifHandlers.delete(type);
  },

  /**
   * See what push permissions are currently enabled. `callback` will be
   * invoked with a `permissions` object.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#checkpermissions
   */
  checkPermissions(
    callback: (permision: {
      alert: boolean;
      badge: boolean;
      sound: boolean;
    }) => {}
  ) {
    invariant(typeof callback === "function", "Must provide a valid callback");
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    
    RNCPushNotificationIOS.checkPermissions(callback);
  },

  // NOT IMPLEMENTED

  /**
   * Requests notification permissions from iOS, prompting the user's
   * dialog box. By default, it will request all notification permissions, but
   * a subset of these can be requested by passing a map of requested
   * permissions.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#requestpermissions
   */
  requestPermissions(permissions?: {
    alert?: boolean;
    badge?: boolean;
    sound?: boolean;
    critical?: boolean;
  }): Promise<{
    alert: boolean;
    badge: boolean;
    sound: boolean;
    critical: boolean;
  }> {
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    console.error("PushNotificationIOS.requestPermissions is not implmented");
    return new Promise(() => ({
      alert: false,
      badge: false,
      sound: false,
      critical: false,
    }));
  },

  /**
   * Sets notification category to notification center.
   * Used to set specific actions for notifications that contains specified category
   */
  setNotificationCategories(categories: NotificationCategory[]) {
    console.error(
      "PushNotificationIOS.setNotificationCategories is not implmented"
    );
  },

  /**
   * Removes all pending notifications
   */
  removeAllPendingNotificationRequests() {
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    console.error(
      "PushNotificationIOS.removeAllPendingNotificationRequests is not implmented"
    );
  },

  /**
   * Removes pending notifications with given identifier strings.
   */
  removePendingNotificationRequests(identifiers: string[]) {
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    console.error(
      "PushNotificationIOS.removePendingNotificationRequests is not implmented"
    );
  },

  /**
   * Gets the current badge number for the app icon on the home screen.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getapplicationiconbadgenumber
   */
  getApplicationIconBadgeNumber(callback: Function) {
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    console.error(
      "PushNotificationIOS.getApplicationIconBadgeNumber is not implmented"
    );
  },

  /**
   * Gets the pending local notification requests.
   */
  getPendingNotificationRequests(
    callback: (requests: NotificationRequest[]) => void
  ) {
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    console.error(
      "PushNotificationIOS.getPendingNotificationRequests is not implmented"
    );
  },

  /**
   * This method returns a promise that resolves to either the notification
   * object if the app was launched by a push notification, or `null` otherwise.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#getinitialnotification
   */
  getInitialNotification(): Promise<PushNotificationIOS | undefined> {
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    console.error(
      "PushNotificationIOS.getInitialNotification is not implmented"
    );
    return new Promise(() => {});
  },

  /**
   * Unregister for all remote notifications received via Apple Push Notification service.
   *
   * See https://reactnative.dev/docs/pushnotificationios.html#abandonpermissions
   */
  abandonPermissions() {
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    console.error("PushNotificationIOS.abandonPermissions is not implmented");
  },

  // DEPRECATED

  /**
   * Schedules the localNotification for immediate presentation.
   * @deprecated use `addNotificationRequest` instead
   */
  presentLocalNotification(details: Object) {
    console.error(
      "PushNotificationIOS.presentLocalNotification is deprecated, use addNotificationRequest instead"
    );
  },

  /**
   * Schedules the localNotification for future presentation.
   * @deprecated use `addNotificationRequest` instead
   */
  scheduleLocalNotification(details: Object) {
    console.error(
      "PushNotificationIOS.scheduleLocalNotification is deprecated, use addNotificationRequest instead"
    );
  },

  /**
   * Cancels all scheduled localNotifications.
   * @deprecated use `removeAllPendingNotificationRequests` instead
   * - This method is deprecated in iOS 10 and will be removed from future release
   */
  cancelAllLocalNotifications() {
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    console.error(
      "PushNotificationIOS.cancelAllLocalNotifications is depricated, use removeAllPendingNotificationRequests instead"
    );
  },

  /**
   * Cancel local notifications.
   * @deprecated - use `removePendingNotifications`
   * See https://reactnative.dev/docs/pushnotificationios.html#cancellocalnotification
   */
  cancelLocalNotifications(userInfo: Object) {
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    console.error(
      "PushNotificationIOS.cancelLocalNotifications is depricated, use removePendingNotifications instead"
    );
  },

  /**
   * Gets the local notifications that are currently scheduled.
   * @deprecated - use `getPendingNotificationRequests`
   */
  getScheduledLocalNotifications(callback: Function) {
    invariant(
      RNCPushNotificationIOS,
      "PushNotificationManager is not available."
    );
    console.error(
      "PushNotificationIOS.getScheduledLocalNotifications is deprecated, use getPendingNotificationRequests instead"
    );
  },
};
