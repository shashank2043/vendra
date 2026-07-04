package com.pinnacle.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class PushNotificationServiceImpl implements PushNotificationService {

    private static final Logger log = LoggerFactory.getLogger(PushNotificationServiceImpl.class);

    @Override
    public boolean sendPushNotification(String deviceToken, String title, String body) {
        log.info("Sending Push Notification - Device Token: {}, Title: {}, Body: {}", deviceToken, title, body);
        // Add actual integration code here during the Vendra (e.g. Firebase Cloud Messaging)
        return true;
    }
}
