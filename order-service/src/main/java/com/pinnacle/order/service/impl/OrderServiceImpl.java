package com.pinnacle.order.service.impl;

import com.pinnacle.common.event.OrderPlacedEvent;
import com.pinnacle.order.entity.Order;
import com.pinnacle.order.entity.OrderItem;
import com.pinnacle.order.dto.OrderItemRequest;
import com.pinnacle.order.dto.OrderRequest;
import com.pinnacle.order.dto.OrderResponse;
import com.pinnacle.order.exception.ResourceNotFoundException;
import com.pinnacle.order.mapper.OrderMapper;
import com.pinnacle.order.repository.OrderRepository;
import com.pinnacle.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public OrderResponse createOrder(OrderRequest request, String customerName) {
        log.info("Placing new order for customer: {}", customerName);

        // Sum up total amount
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest item : request.getItems()) {
            total = total.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        Order order = Order.builder()
                .customerName(customerName)
                .status("PENDING")
                .totalAmount(total)
                .createdAt(LocalDateTime.now())
                .build();

        for (OrderItemRequest itemReq : request.getItems()) {
            OrderItem item = OrderItem.builder()
                    .productId(itemReq.getProductId())
                    .quantity(itemReq.getQuantity())
                    .price(itemReq.getPrice())
                    .vendorId(itemReq.getVendorId())
                    .build();
            order.addItem(item);
        }

        Order savedOrder = orderRepository.save(order);

        // Publish OrderPlacedEvent for Saga choreography (taking first item for stock check)
        if (!savedOrder.getItems().isEmpty()) {
            OrderItem firstItem = savedOrder.getItems().get(0);
            OrderPlacedEvent event = OrderPlacedEvent.builder()
                    .orderId(savedOrder.getId())
                    .productId(firstItem.getProductId())
                    .quantity(firstItem.getQuantity())
                    .customerName(customerName)
                    .build();

            log.info("Publishing OrderPlacedEvent to Kafka for Order ID: {}", savedOrder.getId());
            kafkaTemplate.send("order-placed", String.valueOf(savedOrder.getId()), event);
        }

        return orderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByCustomer(String customerName) {
        List<Order> orders = orderRepository.findByCustomerName(customerName);
        return orderMapper.toResponseList(orders);
    }

    @Override
    public void confirmOrder(Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null && "PENDING".equals(order.getStatus())) {
            order.setStatus("CONFIRMED");
            orderRepository.save(order);
            log.info("Order ID: {} status updated to CONFIRMED", id);
        }
    }

    @Override
    public void failOrder(Long id, String reason) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null && "PENDING".equals(order.getStatus())) {
            order.setStatus("FAILED");
            orderRepository.save(order);
            log.warn("Order ID: {} status updated to FAILED. Reason: {}", id, reason);
        }
    }
}
