package com.pinnacle.order.repository;

import com.pinnacle.order.entity.CommissionLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommissionLedgerRepository extends JpaRepository<CommissionLedger, Long> {
    List<CommissionLedger> findByVendorId(String vendorId);
}
