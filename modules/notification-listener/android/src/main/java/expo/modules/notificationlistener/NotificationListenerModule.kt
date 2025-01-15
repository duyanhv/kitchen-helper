package expo.modules.notificationlistener

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL
import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import android.service.notification.NotificationListenerService

class NotificationListenerModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('NotificationListener')` in JavaScript.
    Name("NotificationListener")

    
    // Define events for notification updates
    Events("onNotificationReceived")

    // Function to check if notification access is enabled
    Function("isNotificationServiceEnabled") {
        val enabledListeners = Settings.Secure.getString(appContext.reactContext?.contentResolver,
            "enabled_notification_listeners")
        val packageName = appContext.reactContext?.packageName
        enabledListeners?.contains(packageName ?: "") ?: false
    }

    // Function to open notification access settings
    AsyncFunction("openNotificationSettings") {
        val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        appContext.reactContext?.startActivity(intent)
    }

    // Function to start listening to notifications
    AsyncFunction("startListening") {
        NotificationListenerExampleService.setCallback { notificationData ->
            sendEvent("onNotificationReceived", mapOf(
                "notification" to notificationData
            ))
        }
    }
  }
}
