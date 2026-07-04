package com.pinnacle.notification.kafka.consumer;

import com.pinnacle.notification.dto.NotificationRequest;
import com.pinnacle.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes order-placed events and auto-creates a CUSTOMER notification.
 */
@Component
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true", matchIfMissing = false)
public class OrderEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderEventConsumer.class);

    private final NotificationService notificationService;

    public OrderEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(
            topics = "order-placed",
            groupId = "notification-group",
            containerFactory = "orderKafkaListenerContainerFactory")
    public void onOrderPlaced(OrderPlacedEvent event) {
        log.info("Received order-placed event: {}", event);
        try {
            if (event == null || event.getOrderId() == null) {
                log.warn("Ignoring order-placed event with no orderId: {}", event);
                return;
            }
            String message = "Your order #" + event.getOrderId() + " was placed successfully.";
            NotificationRequest request = NotificationRequest.builder()
                    .role("CUSTOMER")
                    .userId(event.getCustomerName())
                    .message(message)
                    .subject("Order Placed")
                    .body(message)
                    .type("PUSH")
                    .build();
            notificationService.sendNotification(request);
            log.info("Created CUSTOMER notification for order #{}", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to process order-placed event: {}", e.getMessage(), e);
        }
    }
}
