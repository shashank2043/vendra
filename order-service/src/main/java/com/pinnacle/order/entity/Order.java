package com.pinnacle.order.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String customerName;

    // PLACED, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, FAILED
    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Extended fields (frontend depends on these names)
    private String userId;

    private String userName;

    private String vendorId;

    private String parentOrderId;

    @Column(length = 1000)
    private String shippingAddress;

    private String paymentMethod;

    // STANDARD / PREMIUM / VIP
    @Builder.Default
    private String priority = "STANDARD";

    private Long deliveryPartnerId;

    private String deliveryPartnerName;

    private Instant estimatedDeliveryAt;

    private String trackingStatus;

    @Version
    private Long version;

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
