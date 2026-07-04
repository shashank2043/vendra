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
    public VendorResponse getVendor(Long id) {
        return toResponse(findVendor(id));
    }

    @Override
    public VendorResponse approveVendor(Long id) {
        UserProfile v = findVendor(id);
        v.setApprovalStatus("APPROVED");
        v.setApproved(true);
        v.setRejectionReason(null);
        userProfileRepository.save(v);
        try {
            authServiceClient.updateActivation(v.getId(), true);
        } catch (Exception e) {
            log.error("Failed to re-activate vendor {} in auth-service: {}", id, e.getMessage());
        }
        return toResponse(v);
    }

    @Override
    public VendorResponse rejectVendor(Long id, String reason) {
        UserProfile v = findVendor(id);
        v.setApprovalStatus("REJECTED");
        v.setApproved(false);
        v.setRejectionReason(reason);
        userProfileRepository.save(v);
        return toResponse(v);
    }

    @Override
    public VendorResponse updateVendor(Long id, VendorUpdateRequest request) {
        UserProfile v = findVendor(id);
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

    private UserProfile findVendor(Long id) {
        UserProfile v = userProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found for id: " + id));
        return v;
    }

    private VendorResponse toResponse(UserProfile v) {
        return VendorResponse.builder()
                .id(v.getId())
                .userId(v.getId())
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
