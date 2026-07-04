package com.pinnacle.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String parentOrderId;
    private String userId;
    private String userName;
    private String vendorId;
    private List<OrderItemResponse> items;
    private BigDecimal total;
    private String status;
    private LocalDateTime createdAt;
    private String shippingAddress;
    private String paymentMethod;
    private String priority;
    private Long deliveryPartnerId;
    private String deliveryPartnerName;
    private Instant estimatedDeliveryAt;
    private String trackingStatus;
}
