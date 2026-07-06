package com.pinnacle.user.service.impl;

import com.pinnacle.user.client.AuthServiceClient;
import com.pinnacle.user.dto.VendorResponse;
import com.pinnacle.user.dto.VendorUpdateRequest;
import com.pinnacle.user.entity.UserProfile;
import com.pinnacle.user.exception.ResourceNotFoundException;
import com.pinnacle.user.repository.UserProfileRepository;
import com.pinnacle.user.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorServiceImpl implements VendorService {

    private static final Logger log = LoggerFactory.getLogger(VendorServiceImpl.class);
    private static final String VENDOR_ROLE = "VENDOR";

    private final UserProfileRepository userProfileRepository;
    private final AuthServiceClient authServiceClient;

    @Override
    @Transactional(readOnly = true)
    public List<VendorResponse> listVendors(String approvalStatus) {
        List<UserProfile> vendors = (approvalStatus == null || approvalStatus.isBlank())
                ? userProfileRepository.findByRole(VENDOR_ROLE)
                : userProfileRepository.findByRoleAndApprovalStatus(VENDOR_ROLE, approvalStatus);
        return vendors.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VendorResponse getVendor(String idOrUsername) {
        return toResponse(findVendor(idOrUsername));
    }

    @Override
    public VendorResponse approveVendor(String idOrUsername) {
        UserProfile v = findVendor(idOrUsername);
        v.setApprovalStatus("APPROVED");
        v.setApproved(true);
        v.setRejectionReason(null);
        userProfileRepository.save(v);
        try {
            authServiceClient.updateActivation(v.getId(), true);
        } catch (Exception e) {
            log.error("Failed to re-activate vendor {} in auth-service: {}", idOrUsername, e.getMessage());
        }
        return toResponse(v);
    }

    @Override
    public VendorResponse rejectVendor(String idOrUsername, String reason) {
        UserProfile v = findVendor(idOrUsername);
        v.setApprovalStatus("REJECTED");
        v.setApproved(false);
        v.setRejectionReason(reason);
        userProfileRepository.save(v);
        return toResponse(v);
    }

    @Override
    public VendorResponse updateVendor(String idOrUsername, VendorUpdateRequest request) {
        UserProfile v = findVendor(idOrUsername);
        if (request.getBusinessName() != null) v.setBusinessName(request.getBusinessName());
        if (request.getBusinessAddress() != null) v.setBusinessAddress(request.getBusinessAddress());
        if (request.getTaxId() != null) v.setTaxId(request.getTaxId());
        if (request.getPhoneNumber() != null) v.setPhoneNumber(request.getPhoneNumber());
        if (request.getLogoUrl() != null) v.setLogoUrl(request.getLogoUrl());
        if (request.getPriorityTier() != null) v.setPriorityTier(request.getPriorityTier());
        userProfileRepository.save(v);
        return toResponse(v);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorResponse> topVendors(int limit) {
        return userProfileRepository.findByRoleOrderByTrustScoreDesc(VENDOR_ROLE).stream()
                .sorted(Comparator.comparingDouble((UserProfile v) -> v.getTrustScore() == null ? 0.0 : v.getTrustScore()).reversed())
                .limit(Math.max(0, limit))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorResponse> featuredNewVendors() {
        return userProfileRepository.findByRoleAndIsNewOrderByTrustScoreDesc(VENDOR_ROLE, Boolean.TRUE).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Resolves a vendor by its cross-service identity (the username) first, falling back to the
     * numeric profile id for backward compatibility.
     */
    private UserProfile findVendor(String idOrUsername) {
        return userProfileRepository.findByUsername(idOrUsername)
                .or(() -> {
                    try {
                        return userProfileRepository.findById(Long.valueOf(idOrUsername));
                    } catch (NumberFormatException e) {
                        return java.util.Optional.empty();
                    }
                })
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found: " + idOrUsername));
    }

    private VendorResponse toResponse(UserProfile v) {
        return VendorResponse.builder()
                .id(v.getUsername())
                .userId(v.getUsername())
                .businessName(v.getBusinessName())
                .approvalStatus(v.getApprovalStatus())
                .rejectionReason(v.getRejectionReason())
                .logoUrl(v.getLogoUrl())
                .trustScore(v.getTrustScore())
                .avgRating(v.getAvgRating())
                .totalOrders(v.getTotalOrders())
                .badges(TrustScoreServiceImpl.parseBadges(v.getBadges()))
                .isNew(v.getIsNew())
                .createdAt(v.getCreatedAt())
                .build();
    }
}
