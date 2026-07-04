package com.pinnacle.notification.service;

import com.pinnacle.notification.dto.NotificationRequest;
import com.pinnacle.notification.dto.NotificationDto;

import java.util.List;

public interface NotificationService {
    NotificationDto sendNotification(NotificationRequest request);
    List<NotificationDto> getNotificationHistory(String recipient);
}
