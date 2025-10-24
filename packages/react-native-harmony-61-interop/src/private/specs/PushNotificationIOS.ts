/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export type NotificationRequest = {
  /**
   * identifier of the notification.
   * Required in order to retrieve specific notification.
   */
  id: string;
  /**
   * A short description of the reason for the alert.
   */
  title?: string;
  /**
   * A secondary description of the reason for the alert.
   */
  subtitle?: string;
  /**
   * The message displayed in the notification alert.
   */
  body?: string;
  /**
   * The number to display as the app's icon badge.
   */
  badge?: number;
  /**
   * The sound to play when the notification is delivered.
   */
  sound?: string;
  /**
   * The category of this notification. Required for actionable notifications.
   */
  category?: string;
  /**
   * The thread identifier of this notification.
   */
  threadId?: string;
  /**
   * The date which notification triggers.
   */
  fireDate?: string;
  /**
   * Sets notification to repeat daily.
   * Must be used with fireDate.
   */
  repeats?: boolean;
  /**
   * Define what components should be used in the fireDate during repeats.
   * Must be used with repeats and fireDate.
   */
  repeatsComponent?: {
    year?: boolean;
    month?: boolean;
    day?: boolean;
    dayOfWeek?: boolean;
    hour?: boolean;
    minute?: boolean;
    second?: boolean;
  };
  /**
   * Sets notification to be silent
   */
  isSilent?: boolean;
  /**
   * Sets notification to be critical
   */
  isCritical?: boolean;
  /**
   * The volume for the critical alert’s sound. Set this to a value between 0.0 (silent) and 1.0 (full volume).
   */
  criticalSoundVolume?: number;
  /**
   * Optional data to be added to the notification
   */
  userInfo?: Object;
  /**
   * FireDate adjusted automatically upon time zone changes (e.g. for an alarm clock).
   */
  isTimeZoneAgnostic?: boolean;
};

/**
 * Alert Object that can be included in the aps `alert` object
 */
export type NotificationAlert = {
  title?: string;
  subtitle?: string;
  body?: string;
};

/**
 * Notification Category that can include specific actions
 */
export type NotificationCategory = {
  /**
   * Identifier of the notification category.
   * Notification with this category will have the specified actions.
   */
  id: string;
  actions: NotificationAction[];
};

/**
 * Notification Action that can be added to specific categories
 */
export type NotificationAction = {
  /**
   * Identifier of Action.
   * This value will be returned as actionIdentifier when notification is received.
   */
  id: string;
  /**
   * Text to be shown on notification action button.
   */
  title: string;
  /**
   * Option for notification action.
   */
  options?: {
    foreground?: boolean;
    destructive?: boolean;
    authenticationRequired?: boolean;
  };
  /**
   * Option for textInput action.
   * If textInput prop exists, then user action will automatically become a text input action.
   * The text user inputs will be in the userText field of the received notification.
   */
  textInput?: {
    /**
     * Text to be shown on button when user finishes text input.
     * Default is "Send" or its equivalent word in user's language setting.
     */
    buttonTitle?: string;
    /**
     * Placeholder for text input for text input action.
     */
    placeholder?: string;
  };
};

export interface Spec extends TurboModule {
  addNotificationRequest(notificationRequest: NotificationRequest): void;
  removeAllDeliveredNotifications(): void;
  setApplicationIconBadgeNumber(badgeNumber: number): void;
  removeDeliveredNotifications(identifiers: string[]): void;
  getDeliveredNotifications(callback: (result: object[]) => void): void;
  checkPermissions(
    callback: (permission: {
      alert: boolean;
      badge: boolean;
      sound: boolean;
    }) => void
  ): void;

  addListener(): void;
  removeListeners(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>("RNPushNotificationIOS");
