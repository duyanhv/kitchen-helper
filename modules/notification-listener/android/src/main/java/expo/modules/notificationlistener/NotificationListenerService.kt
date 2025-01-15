package expo.modules.notificationlistener

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.google.gson.Gson

class NotificationListenerExampleService : NotificationListenerService() {
    companion object {
        private var instance: NotificationListenerExampleService? = null
        private var notificationCallback: ((String) -> Unit)? = null

        private val gson = Gson()
        fun setCallback(callback: (String) -> Unit) {
            notificationCallback = callback
        }
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val notification = sbn.notification
        val bundle = notification.extras

        if (bundle.getString("android.title") == null && bundle.getString("android.text") == null) {
            return
        }

        val notificationData =
                mapOf(
                        "packageName" to sbn.packageName,
                        "postTime" to sbn.postTime,
                        "key" to sbn.key,
                        "id" to sbn.id,
                        "tag" to sbn.tag,
                        "groupKey" to sbn.groupKey,
                        "overrideGroupKey" to sbn.overrideGroupKey,
                        "userId" to sbn.userId,
                        "isOngoing" to sbn.isOngoing,
                        "isClearable" to sbn.isClearable,
                        "title" to bundle.getString("android.title"),
                        "text" to bundle.getString("android.text"),
                        "subText" to bundle.getString("android.subText"),
                        "summaryText" to bundle.getString("android.summaryText"),
                        "infoText" to bundle.getString("android.infoText"),
                        "bigText" to bundle.getCharSequence("android.bigText")?.toString(),
                        "when" to notification.`when`,
                        "number" to notification.number,
                        "flags" to notification.flags,
                        "priority" to notification.priority,
                        "category" to notification.category,
                        "channelId" to notification.channelId,
                        "tickerText" to notification.tickerText?.toString(),
                        "contentIntent" to (notification.contentIntent != null),
                        "deleteIntent" to (notification.deleteIntent != null),
                        "fullScreenIntent" to (notification.fullScreenIntent != null),
                        "actionCount" to (notification.actions?.size ?: 0),
                        "sender" to bundle.getString("android.title"),
                        "messages" to bundle.getParcelableArray("android.messages")?.size,
                        "isGroupSummary" to
                                ((notification.flags and
                                        android.app.Notification.FLAG_GROUP_SUMMARY) != 0)
                )

        notificationCallback?.invoke(gson.toJson(notificationData))
    }
    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        // Handle removed notifications if needed
    }
}
