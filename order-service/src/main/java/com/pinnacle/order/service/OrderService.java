package com.pinnacle.order.service;

import com.pinnacle.order.dto.OrderRequest;
import com.pinnacle.order.dto.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(OrderRequest request, String customerName);
    OrderResponse getOrderById(Long id);
    List<OrderResponse> getOrdersByCustomer(String customerName);
    void confirmOrder(Long id);
    void failOrder(Long id, String reason);
}
