package com.pinnacle.vendra.notification.service;

public interface PushNotificationService {
    boolean sendPushNotification(String deviceToken, String title, String body);
}
