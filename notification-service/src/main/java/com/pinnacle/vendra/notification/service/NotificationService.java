package com.pinnacle.vendra.notification.service;

import com.pinnacle.vendra.common.dto.NotificationRequest;
import com.pinnacle.vendra.notification.dto.NotificationDto;

import java.util.List;

public interface NotificationService {
    NotificationDto sendNotification(NotificationRequest request);
    List<NotificationDto> getNotificationHistory(String recipient);
}
