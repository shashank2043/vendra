package com.pinnacle.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeResponse {
    private Long id;
    private String orderId;
    private String vendorId;
    private String userId;
    private String reason;
    private String status;
    private String resolutionNotes;
    private Instant createdAt;
}
