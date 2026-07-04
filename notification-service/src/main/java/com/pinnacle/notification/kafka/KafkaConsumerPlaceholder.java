package com.pinnacle.notification.kafka;

import com.pinnacle.notification.dto.NotificationRequest;
import com.pinnacle.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true", matchIfMissing = false)
public class KafkaConsumerPlaceholder {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerPlaceholder.class);
    private final NotificationService notificationService;

    public KafkaConsumerPlaceholder(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "${app.kafka.notification-topic:notifications-topic}", groupId = "${spring.kafka.consumer.group-id:notification-group}")
    public void listenNotification(NotificationRequest request) {
        log.info("Received notification request from Kafka broker: {}", request);
        try {
            notificationService.sendNotification(request);
        } catch (Exception e) {
            log.error("Failed to process notification received from Kafka: {}", e.getMessage(), e);
        }
    }
}
