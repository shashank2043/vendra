package com.pinnacle.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    private String userId;

    private String vendorId;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequest> items;

    private BigDecimal total;

    private String shippingAddress;

    private String paymentMethod;

    // STANDARD / PREMIUM / VIP (optional -> defaults to STANDARD)
    private String priority;
}
