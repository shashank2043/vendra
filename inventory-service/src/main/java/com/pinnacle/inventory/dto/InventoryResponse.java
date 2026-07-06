package com.pinnacle.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {
    private Long id;
    private String productId;
    private Integer quantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;
    private String vendorId;
}
