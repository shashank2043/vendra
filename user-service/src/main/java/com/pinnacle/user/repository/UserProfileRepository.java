package com.pinnacle.user.repository;

import com.pinnacle.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUsername(String username);

    List<UserProfile> findByRole(String role);

    List<UserProfile> findByRoleAndApprovalStatus(String role, String approvalStatus);

    List<UserProfile> findByRoleOrderByTrustScoreDesc(String role);

    List<UserProfile> findByRoleAndIsNewOrderByTrustScoreDesc(String role, Boolean isNew);
}
