package com.pinnacle.order.repository;

import com.pinnacle.order.entity.DeliveryPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {
    List<DeliveryPartner> findByActiveTrueOrderByAvgDeliveryHoursAsc();
}
