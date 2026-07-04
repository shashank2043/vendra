package com.pinnacle.order.kafka.consumer;

import com.pinnacle.common.event.InventoryReservationFailedEvent;
import com.pinnacle.common.event.InventoryReservedEvent;
import com.pinnacle.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InventoryResultConsumer {

    private static final Logger log = LoggerFactory.getLogger(InventoryResultConsumer.class);

    private final OrderService orderService;

    @KafkaListener(topics = "inventory-reserved", groupId = "order-group")
    public void consumeReserved(InventoryReservedEvent event) {
        log.info("Received InventoryReservedEvent for Order ID: {}", event.getOrderId());
        orderService.confirmOrder(event.getOrderId());
    }

    @KafkaListener(topics = "inventory-failed", groupId = "order-group")
    public void consumeFailed(InventoryReservationFailedEvent event) {
        log.warn("Received InventoryReservationFailedEvent for Order ID: {}. Reason: {}", 
                event.getOrderId(), event.getReason());
        orderService.failOrder(event.getOrderId(), event.getReason());
    }
}
