package com.pinnacle.user.service.impl;

import com.pinnacle.user.client.AuthServiceClient;
import com.pinnacle.user.dto.CustomerProfileUpdateRequest;
import com.pinnacle.user.dto.UserProfileCreateRequest;
import com.pinnacle.user.dto.UserProfileResponse;
import com.pinnacle.user.dto.VendorProfileUpdateRequest;
import com.pinnacle.user.entity.UserProfile;
import com.pinnacle.user.exception.ResourceNotFoundException;
import com.pinnacle.user.mapper.UserProfileMapper;
import com.pinnacle.user.repository.UserProfileRepository;
import com.pinnacle.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Transactional
public class UserProfileServiceImpl implements UserProfileService {

    private static final Logger log = LoggerFactory.getLogger(UserProfileServiceImpl.class);

    private final UserProfileRepository userProfileRepository;
    private final UserProfileMapper userProfileMapper;
    private final AuthServiceClient authServiceClient;

    @Override
    public UserProfileResponse createProfile(UserProfileCreateRequest request) {
        log.info("Creating user profile for: {} with role: {}", request.getUsername(), request.getRole());
        UserProfile profile = userProfileMapper.toEntity(request);
        profile.setId(request.getUserId());
        profile.setCreatedAt(Instant.now());
        if (profile.getPriorityTier() == null) {
            profile.setPriorityTier("STANDARD");
        }
        profile.setSuspended(false);

        if ("VENDOR".equalsIgnoreCase(request.getRole())) {
            // New vendors start as PENDING (or APPROVED if pre-approved) with a neutral baseline
            profile.setApprovalStatus(request.isApproved() ? "APPROVED" : "PENDING");
            profile.setIsNew(true);
            profile.setTotalOrders(0);
            if (profile.getTrustScore() == null) {
                profile.setTrustScore(60.0); // baseline so new vendors are not buried
            }
        }

        UserProfile savedProfile = userProfileRepository.save(profile);
        return userProfileMapper.toResponse(savedProfile);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String username) {
        UserProfile profile = userProfileRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for username: " + username));
        return userProfileMapper.toResponse(profile);
    }

    @Override
    public UserProfileResponse updateCustomerProfile(CustomerProfileUpdateRequest request, String username) {
        log.info("Updating customer profile for: {}", username);
        UserProfile profile = userProfileRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for username: " + username));

        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setShippingAddress(request.getShippingAddress());
        profile.setPhoneNumber(request.getPhoneNumber());

        UserProfile savedProfile = userProfileRepository.save(profile);
        return userProfileMapper.toResponse(savedProfile);
    }

    @Override
    public UserProfileResponse updateVendorProfile(VendorProfileUpdateRequest request, String username) {
        log.info("Updating vendor profile for: {}. Account will be deactivated pending moderation.", username);
        UserProfile profile = userProfileRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for username: " + username));

        profile.setBusinessName(request.getBusinessName());
        profile.setBusinessAddress(request.getBusinessAddress());
        profile.setTaxId(request.getTaxId());
        profile.setPhoneNumber(request.getPhoneNumber());

        // Vendor updates require admin approval
        profile.setApproved(false);
        profile.setApprovalStatus("PENDING");
        userProfileRepository.save(profile);

        // Deactivate vendor account in Keycloak via Feign Client
        try {
            authServiceClient.updateActivation(profile.getId(), false);
        } catch (Exception e) {
            log.error("Failed to notify auth-service of vendor deactivation", e);
        }

        return userProfileMapper.toResponse(profile);
    }

    @Override
    public void approveVendor(Long id) {
        log.info("Approving vendor profile for user ID: {}", id);
        UserProfile profile = userProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user ID: " + id));

        profile.setApproved(true);
        profile.setApprovalStatus("APPROVED");
        userProfileRepository.save(profile);

        // Reactivate vendor account in Keycloak via Feign Client
        authServiceClient.updateActivation(profile.getId(), true);
    }
}
