package com.pinnacle.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommissionLedgerResponse {
    private Long id;
    private String vendorId;
    private String orderId;
    // Field names match the vendor Earnings page.
    private BigDecimal grossSales;
    // 0..1 fraction (commission / gross).
    private BigDecimal commissionRate;
    private BigDecimal commissionDeducted;
    private BigDecimal netPayout;
    private Instant createdAt;
}
