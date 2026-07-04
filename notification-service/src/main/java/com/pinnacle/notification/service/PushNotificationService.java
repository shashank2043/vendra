package com.pinnacle.notification.service;

public interface PushNotificationService {
    boolean sendPushNotification(String deviceToken, String title, String body);
}
