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
public class CommissionRuleRequest {
    private String category;
    private BigDecimal ratePercent;
    private Boolean active;
}
