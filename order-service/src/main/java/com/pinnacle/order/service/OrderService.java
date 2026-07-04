package com.pinnacle.order.service;

import com.pinnacle.order.dto.OrderRequest;
import com.pinnacle.order.dto.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(OrderRequest request, String customerName);
    OrderResponse getOrderById(Long id);
    List<OrderResponse> getOrdersByCustomer(String customerName);
    List<OrderResponse> getOrders(String userId, String vendorId, String status);
    OrderResponse updateStatus(Long id, String status);
    void confirmOrder(Long id);
    void failOrder(Long id, String reason);
}
