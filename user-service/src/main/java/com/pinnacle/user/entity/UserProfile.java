package com.pinnacle.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

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

    // Vendor approval / moderation
    @Column(length = 20)
    private String approvalStatus; // PENDING / APPROVED / REJECTED

    @Column(length = 1000)
    private String rejectionReason;

    private String logoUrl;

    @Builder.Default
    @Column(length = 20)
    private String priorityTier = "STANDARD"; // STANDARD / PREMIUM / VIP

    // Trust / reputation fields
    private Double trustScore;   // 0-100
    private Double avgRating;    // 0-5
    private Integer totalOrders;
    private Double onTimeRate;      // 0-100
    private Double cancellationRate; // 0-100
    private Double disputeRate;      // 0-100

    @Column(length = 500)
    private String badges; // comma-separated

    private Boolean isNew;

    private Instant createdAt;

    // Admin suspension state (mirrors auth-service "enabled" flag: suspended == !enabled)
    @Builder.Default
    private Boolean suspended = false;
}
