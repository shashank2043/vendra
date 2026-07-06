package com.pinnacle.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorUpdateRequest {
    private String businessName;
    private String businessAddress;
    private String taxId;
    private String phoneNumber;
    private String logoUrl;
    private String priorityTier;
}
