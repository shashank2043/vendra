package com.pinnacle.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrustScoreResponse {
    private Long vendorId;
    private Double trustScore;
    private Double avgRating;
    private Integer totalOrders;
    private Double onTimeRate;
    private Double cancellationRate;
    private Double disputeRate;
    private List<String> badges;
    private Boolean isNew;
    private Integer rank;
}
