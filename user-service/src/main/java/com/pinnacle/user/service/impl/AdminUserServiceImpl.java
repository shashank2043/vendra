package com.pinnacle.user.service.impl;

import com.pinnacle.user.client.AuthServiceClient;
import com.pinnacle.user.dto.AdminUserResponse;
import com.pinnacle.user.entity.UserProfile;
import com.pinnacle.user.exception.ResourceNotFoundException;
import com.pinnacle.user.repository.UserProfileRepository;
import com.pinnacle.user.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserServiceImpl implements AdminUserService {

    private static final Logger log = LoggerFactory.getLogger(AdminUserServiceImpl.class);

    private final UserProfileRepository userProfileRepository;
    private final AuthServiceClient authServiceClient;

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers() {
        return userProfileRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AdminUserResponse setSuspended(Long id, boolean suspended) {
        UserProfile u = userProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + id));
        u.setSuspended(suspended);
        userProfileRepository.save(u);
        // enabled == !suspended
        authServiceClient.updateActivation(u.getId(), !suspended);
        log.info("User {} suspended={}", id, suspended);
        return toResponse(u);
    }

    private AdminUserResponse toResponse(UserProfile u) {
        return AdminUserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .name(u.getUsername())
                .role(u.getRole())
                .suspended(u.getSuspended() != null && u.getSuspended())
                .approvalStatus(u.getApprovalStatus())
                .build();
    }
}
