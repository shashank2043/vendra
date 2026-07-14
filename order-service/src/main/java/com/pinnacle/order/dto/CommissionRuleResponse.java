package com.pinnacle.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommissionRuleResponse {
    private Long id;
    private String categoryName;
    // 0..1 fraction, as the frontend expects (it renders commissionRate * 100).
    private BigDecimal commissionRate;
    private boolean active;
}
