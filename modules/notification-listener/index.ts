// Reexport the native module. On web, it will be resolved to NotificationListenerModule.web.ts
// and on native platforms to NotificationListenerModule.ts
export { default } from './src/NotificationListenerModule';
export { default as NotificationListenerView } from './src/NotificationListenerView';
export * from  './src/NotificationListener.types';
