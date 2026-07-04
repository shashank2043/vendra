package com.pinnacle.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorResponse {
    private Long id;      // = userId
    private Long userId;
    private String businessName;
    private String approvalStatus;
    private String rejectionReason;
    private String logoUrl;
    private Double trustScore;
    private Double avgRating;
    private Integer totalOrders;
    private List<String> badges;
    private Boolean isNew;
    private Instant createdAt;
}
