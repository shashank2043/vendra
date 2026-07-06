package com.pinnacle.order.repository;

import com.pinnacle.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerName(String customerName);

    List<Order> findByStatus(String status);

    @Query("SELECT o FROM Order o WHERE (:userId IS NULL OR o.userId = :userId) "
            + "AND (:vendorId IS NULL OR o.vendorId = :vendorId) "
            + "AND (:status IS NULL OR o.status = :status)")
    List<Order> search(@Param("userId") String userId,
                       @Param("vendorId") String vendorId,
                       @Param("status") String status);
}
