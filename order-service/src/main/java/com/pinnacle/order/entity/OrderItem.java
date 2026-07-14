package com.pinnacle.order.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String productId;

    // Product name/image snapshot at purchase time so order views don't depend
    // on a live product-service lookup (and survive later product edits/deletes).
    private String name;

    // Image values may be long CDN URLs or inline data URIs (uploaded images),
    // which exceed both VARCHAR(255) and TEXT(64KB); store as MEDIUMTEXT.
    @Column(columnDefinition = "MEDIUMTEXT")
    private String imageUrl;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private String vendorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;
}
