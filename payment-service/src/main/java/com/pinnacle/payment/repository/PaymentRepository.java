package com.pinnacle.payment.repository;

import com.pinnacle.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findFirstByOrderIdOrderByCreatedAtDesc(String orderId);
    Optional<Payment> findFirstByRazorpayOrderIdOrderByCreatedAtDesc(String razorpayOrderId);
}
