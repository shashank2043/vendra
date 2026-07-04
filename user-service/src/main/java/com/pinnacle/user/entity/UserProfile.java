package com.pinnacle.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String role; // CUSTOMER, VENDOR, ADMIN

    @Column(nullable = false)
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
