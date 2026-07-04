package com.pinnacle.user.config;

import com.pinnacle.user.entity.UserProfile;
import com.pinnacle.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Seeds user-service profiles for the demo Keycloak users (admin/vendor/user) so they can be
 * used immediately without going through the register -> approve flow.
 *
 * The ids MUST match auth-service's generated User ids for the same usernames, because the
 * frontend uses the id returned by /auth/profile (an auth-service User id) when calling the
 * vendor endpoints in this service. auth-service's DatabaseInitializer seeds admin, user, vendor
 * in that order with IDENTITY ids, so on a fresh database they are 1, 2, 3 respectively.
 *
 * Idempotent: each profile is only created if one with the same username does not already exist.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DemoDataInitializer implements CommandLineRunner {

    private final UserProfileRepository userProfileRepository;

    @Override
    public void run(String... args) {
        seedProfile(UserProfile.builder()
                .id(1L)
                .username("admin")
                .email("admin@vendra.com")
                .role("ADMIN")
                .approved(true)
                .approvalStatus("APPROVED")
                .priorityTier("STANDARD")
                .isNew(false)
                .suspended(false)
                .createdAt(Instant.now())
                .build());

        seedProfile(UserProfile.builder()
                .id(2L)
                .username("user")
                .email("user@vendra.com")
                .role("CUSTOMER")
                .approved(true)
                .approvalStatus("APPROVED")
                .firstName("Demo")
                .lastName("Customer")
                .shippingAddress("221B Demo Street, Bengaluru")
                .priorityTier("PREMIUM")
                .isNew(false)
                .suspended(false)
                .createdAt(Instant.now())
                .build());

        seedProfile(UserProfile.builder()
                .id(3L)
                .username("vendor")
                .email("vendor@vendra.com")
                .role("VENDOR")
                .approved(true)
                .approvalStatus("APPROVED")
                .businessName("Demo Vendor Store")
                .businessAddress("Plot 7, Market Road, Hyderabad")
                .priorityTier("STANDARD")
                .trustScore(72.0)
                .avgRating(4.6)
                .totalOrders(8)
                .onTimeRate(96.0)
                .cancellationRate(4.0)
                .disputeRate(2.0)
                .badges("TOP_RATED,FAST_SHIPPER")
                .isNew(false)
                .suspended(false)
                .createdAt(Instant.now())
                .build());
    }

    private void seedProfile(UserProfile profile) {
        userProfileRepository.findByUsername(profile.getUsername())
                .ifPresentOrElse(
                        existing -> log.info("Demo profile '{}' already exists (id={}), skipping",
                                existing.getUsername(), existing.getId()),
                        () -> {
                            userProfileRepository.save(profile);
                            log.info("Seeded demo {} profile '{}' (id={})",
                                    profile.getRole(), profile.getUsername(), profile.getId());
                        });
    }
}
