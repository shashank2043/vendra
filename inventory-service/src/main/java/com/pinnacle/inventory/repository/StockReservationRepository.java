package com.pinnacle.inventory.repository;

import com.pinnacle.inventory.entity.StockReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface StockReservationRepository extends JpaRepository<StockReservation, Long> {
    List<StockReservation> findByStatusAndCreatedAtBefore(String status, Instant cutoff);
}
