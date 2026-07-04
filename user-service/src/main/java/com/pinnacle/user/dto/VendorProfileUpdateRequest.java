package com.pinnacle.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorProfileUpdateRequest {
    @NotBlank(message = "Business name is required")
    private String businessName;

    @NotBlank(message = "Business address is required")
    private String businessAddress;

    @NotBlank(message = "Tax ID is required")
    private String taxId;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
}
