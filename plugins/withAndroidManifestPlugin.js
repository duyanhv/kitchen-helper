const {
  withAndroidManifest,
} = require("expo/config-plugins");

module.exports = function withAndroidManifestPlugin(appConfig) {
  return withAndroidManifest(appConfig, function (decoratedAppConfig) {
    try {
       const androidManifest = decoratedAppConfig.modResults.manifest;
       if (!androidManifest.application[0].service) {
              androidManifest.application[0].service = [];
            }

      // Create the service configuration
      const serviceConfig = {
        $: {
          "android:name": ".NotificationListenerExampleService",
          "android:label": "@string/service_label",
          "android:permission":
            "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE",
        },
        "intent-filter": [
          {
            action: [
              {
                $: {
                  "android:name":
                    "android.service.notification.NotificationListenerService",
                },
              },
            ],
          },
        ],
      };

      // Add the service to the manifest
      androidManifest.application[0].service.push(serviceConfig);
    } catch (e) {
      console.error(`withAndroidManifestPlugin failed`, e);
    }
    return decoratedAppConfig;
  });
};
