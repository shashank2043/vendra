package com.pinnacle.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileCreateRequest {
    private Long userId;
    private String username;
    private String email;
    private String role;
    private boolean approved;

    // Customer fields
    private String firstName;
    private String lastName;
    private String shippingAddress;

    // Vendor fields
    private String businessName;
    private String businessAddress;
    private String taxId;

    // Contact field
    private String phoneNumber;
}
