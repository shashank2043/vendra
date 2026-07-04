package com.pinnacle.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeRequest {
    @NotBlank(message = "Order ID is required")
    private String orderId;

    private String vendorId;

    private String userId;

    @NotBlank(message = "Reason is required")
    private String reason;
}
