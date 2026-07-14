package com.pinnacle.order.service.impl;

import com.pinnacle.common.event.OrderPlacedEvent;
import com.pinnacle.order.entity.Order;
import com.pinnacle.order.entity.OrderItem;
import com.pinnacle.order.dto.OrderItemRequest;
import com.pinnacle.order.dto.OrderRequest;
import com.pinnacle.order.dto.OrderResponse;
import com.pinnacle.order.exception.BadRequestException;
import com.pinnacle.order.exception.ResourceNotFoundException;
import com.pinnacle.order.mapper.OrderMapper;
import com.pinnacle.order.repository.OrderRepository;
import com.pinnacle.order.service.CommissionService;
import com.pinnacle.order.service.DeliveryService;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final DeliveryService deliveryService;
    private final CommissionService commissionService;

    @Override
    public OrderResponse createOrder(OrderRequest request, String customerName) {
        log.info("Placing new order for customer: {}", customerName);

        // Sum up total amount from items (fallback if request.total not supplied)
        BigDecimal computed = BigDecimal.ZERO;
        for (OrderItemRequest item : request.getItems()) {
            computed = computed.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        BigDecimal total = request.getTotal() != null ? request.getTotal() : computed;

        String priority = request.getPriority() != null && !request.getPriority().isBlank()
                ? request.getPriority().toUpperCase()
                : "STANDARD";

        Order order = Order.builder()
                .customerName(customerName)
                .userName(customerName)
                .userId(request.getUserId())
                .vendorId(request.getVendorId())
                .status("PLACED")
                .totalAmount(total)
                .parentOrderId(UUID.randomUUID().toString())
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .priority(priority)
                .createdAt(LocalDateTime.now())
                .build();

        for (OrderItemRequest itemReq : request.getItems()) {
            OrderItem item = OrderItem.builder()
                    .productId(itemReq.getProductId())
                    .name(itemReq.getName())
                    .imageUrl(itemReq.getImageUrl())
                    .quantity(itemReq.getQuantity())
                    .price(itemReq.getPrice())
                    .vendorId(itemReq.getVendorId())
                    .build();
            order.addItem(item);
        }

        Order savedOrder = orderRepository.save(order);

        // Publish one OrderPlacedEvent per item so ALL items are reserved by inventory-service.
        for (OrderItem item : savedOrder.getItems()) {
            OrderPlacedEvent event = OrderPlacedEvent.builder()
                    .orderId(savedOrder.getId())
                    .productId(item.getProductId())
                    .quantity(item.getQuantity())
                    .customerName(customerName)
                    .build();

            log.info("Publishing OrderPlacedEvent to Kafka for Order ID: {}, product: {}", savedOrder.getId(), item.getProductId());
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
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(String userId, String vendorId, String status) {
        List<Order> orders = orderRepository.search(
                emptyToNull(userId), emptyToNull(vendorId), emptyToNull(status));
        return orderMapper.toResponseList(orders);
    }

    @Override
    public OrderResponse updateStatus(Long id, String status) {
        if (status == null || status.isBlank()) {
            throw new BadRequestException("Status is required");
        }
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        String newStatus = status.toUpperCase();
        order.setStatus(newStatus);

        // Auto-assign a delivery partner when moving to PROCESSING/SHIPPED without one.
        if (("SHIPPED".equals(newStatus) || "PROCESSING".equals(newStatus))
                && order.getDeliveryPartnerId() == null) {
            deliveryService.autoAssign(order);
        }

        Order saved = orderRepository.save(order);
        log.info("Order ID: {} status updated to {}", id, newStatus);
        return orderMapper.toResponse(saved);
    }

    @Override
    public void confirmOrder(Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null && "PLACED".equals(order.getStatus())) {
            order.setStatus("CONFIRMED");
            orderRepository.save(order);
            log.info("Order ID: {} status updated to CONFIRMED", id);
            // Record commission on confirmation.
            commissionService.recordCommission(order);
        }
    }

    @Override
    public void failOrder(Long id, String reason) {
        // A newly placed order must remain in PLACED by default. An inventory reservation
        // shortfall no longer auto-fails the order; it is only logged so it can be reviewed
        // and handled manually (vendor/admin) or retried once stock is available.
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            log.warn("Inventory reservation could not be fulfilled for Order ID: {} (left in {} state). Reason: {}",
                    id, order.getStatus(), reason);
        }
    }

    private String emptyToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }
}
