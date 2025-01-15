import type { StyleProp, ViewStyle } from 'react-native';

export interface NotificationData {
  packageName: string;
  title: string | null;
  text: string | null;
  postTime: number;
  key: string;
}

export interface NotificationEvent {
  notification: string; // The stringified NotificationData
}
export interface NotificationListenerModuleType {
  isNotificationServiceEnabled(): Promise<boolean>;
  openNotificationSettings(): Promise<void>;
  startListening(): Promise<void>;
  addListener(
    eventName: 'onNotificationReceived',
    listener: (event: NotificationEvent) => void
  ): { remove: () => void };
}