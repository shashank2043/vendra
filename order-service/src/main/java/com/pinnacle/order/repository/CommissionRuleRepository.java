package com.pinnacle.order.repository;

import com.pinnacle.order.entity.CommissionRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommissionRuleRepository extends JpaRepository<CommissionRule, Long> {
    List<CommissionRule> findByActiveTrue();

    Optional<CommissionRule> findFirstByCategoryAndActiveTrue(String category);

    Optional<CommissionRule> findFirstByCategoryIsNullAndActiveTrue();
}
