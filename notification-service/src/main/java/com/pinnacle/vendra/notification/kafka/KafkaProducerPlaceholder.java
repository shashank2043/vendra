package com.pinnacle.vendra.notification.kafka;

import com.pinnacle.vendra.common.dto.NotificationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true", matchIfMissing = false)
public class KafkaProducerPlaceholder {

    private static final Logger log = LoggerFactory.getLogger(KafkaProducerPlaceholder.class);
    
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.kafka.notification-topic:notifications-topic}")
    private String topicName;

    public KafkaProducerPlaceholder(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishNotificationEvent(NotificationRequest request) {
        log.info("Publishing notification event to Kafka topic [{}]: {}", topicName, request);
        try {
            kafkaTemplate.send(topicName, request.getRecipient(), request);
        } catch (Exception e) {
            log.error("Failed to send notification request to Kafka: {}", e.getMessage(), e);
        }
    }
}
