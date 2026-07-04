package com.pinnacle.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReservationFailedEvent {
    private Long orderId;
    private String productId;
    private Integer quantity;
    private String reason;
}
