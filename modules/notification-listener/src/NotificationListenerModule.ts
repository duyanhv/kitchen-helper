import { NativeModule, requireNativeModule } from 'expo';

interface NotificationListenerModuleEvents {
  onNotificationReceived: { notification: string };
}

declare class NotificationListenerModule extends NativeModule<NotificationListenerModuleEvents> {
  isNotificationServiceEnabled(): boolean;
  openNotificationSettings(): Promise<void>;
  startListening(): Promise<void>;
}

export default requireNativeModule<NotificationListenerModule>('NotificationListener');