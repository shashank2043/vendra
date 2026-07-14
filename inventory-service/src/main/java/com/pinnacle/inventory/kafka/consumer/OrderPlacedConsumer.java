package com.pinnacle.inventory.kafka.consumer;

import com.pinnacle.common.event.InventoryReservationFailedEvent;
import com.pinnacle.common.event.InventoryReservedEvent;
import com.pinnacle.common.event.OrderPlacedEvent;
import com.pinnacle.inventory.client.ProductServiceClient;
import com.pinnacle.inventory.dto.InventoryResponse;
import com.pinnacle.inventory.dto.StockUpdateRequest;
import com.pinnacle.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderPlacedConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderPlacedConsumer.class);

    private final InventoryService inventoryService;
    private final ProductServiceClient productServiceClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "order-placed", groupId = "inventory-group")
    public void consume(OrderPlacedEvent event) {
        log.info("Received OrderPlacedEvent for order: {}, product: {}, qty: {}",
                event.getOrderId(), event.getProductId(), event.getQuantity());

        try {
            boolean success = inventoryService.reserveStock(
                    String.valueOf(event.getOrderId()), event.getProductId(), event.getQuantity());
            if (success) {
                log.info("Inventory successfully reserved for order: {}", event.getOrderId());
                // Push the new remaining stock to product-service right away so customers
                // see accurate availability without waiting for the periodic sync scheduler.
                syncProductStock(event.getProductId());
                InventoryReservedEvent reservedEvent = InventoryReservedEvent.builder()
                        .orderId(event.getOrderId())
                        .productId(event.getProductId())
                        .quantity(event.getQuantity())
                        .build();
                kafkaTemplate.send("inventory-reserved", String.valueOf(event.getOrderId()), reservedEvent);
            } else {
                log.warn("Inventory reservation failed (insufficient stock) for order: {}", event.getOrderId());
                InventoryReservationFailedEvent failedEvent = InventoryReservationFailedEvent.builder()
                        .orderId(event.getOrderId())
                        .productId(event.getProductId())
                        .quantity(event.getQuantity())
                        .reason("Insufficient stock available")
                        .build();
                kafkaTemplate.send("inventory-failed", String.valueOf(event.getOrderId()), failedEvent);
            }
        } catch (Exception e) {
            log.error("Error processing inventory reservation for order: {}", event.getOrderId(), e);
            InventoryReservationFailedEvent failedEvent = InventoryReservationFailedEvent.builder()
                    .orderId(event.getOrderId())
                    .productId(event.getProductId())
                    .quantity(event.getQuantity())
                    .reason("Internal processing error: " + e.getMessage())
                    .build();
            kafkaTemplate.send("inventory-failed", String.valueOf(event.getOrderId()), failedEvent);
        }
    }

    private void syncProductStock(String productId) {
        try {
            InventoryResponse inv = inventoryService.getStockByProductId(productId);
            int available = inv.getAvailableQuantity() != null ? inv.getAvailableQuantity() : inv.getQuantity();
            productServiceClient.updateStock(productId, StockUpdateRequest.builder().stock(available).build());
            log.info("Synced product {} stock to {} after reservation", productId, available);
        } catch (Exception e) {
            log.warn("Could not sync product {} stock after reservation: {}", productId, e.getMessage());
        }
    }
}
