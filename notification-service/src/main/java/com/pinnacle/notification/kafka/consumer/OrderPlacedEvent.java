package com.pinnacle.notification.kafka.consumer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Local mirror of order-service's com.pinnacle.common.event.OrderPlacedEvent.
 * Field names/types must match for JSON deserialization from the "order-placed" topic.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPlacedEvent {
    private Long orderId;
    private String productId;
    private Integer quantity;
    private String customerName;
}
