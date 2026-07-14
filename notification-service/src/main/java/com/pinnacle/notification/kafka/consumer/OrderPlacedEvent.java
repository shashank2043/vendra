package com.pinnacle.notification.kafka.consumer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Local copy of the order-placed event payload. Bound by field name because the
 * consumer factory sets USE_TYPE_INFO_HEADERS=false and VALUE_DEFAULT_TYPE to this
 * class, so field names must match the producer (order-service OrderPlacedEvent).
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
