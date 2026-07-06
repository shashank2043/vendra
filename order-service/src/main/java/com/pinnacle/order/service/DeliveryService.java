package com.pinnacle.order.service;

import com.pinnacle.order.dto.OrderResponse;
import com.pinnacle.order.entity.DeliveryPartner;
import com.pinnacle.order.entity.Order;
import com.pinnacle.order.exception.BadRequestException;
import com.pinnacle.order.exception.ResourceNotFoundException;
import com.pinnacle.order.mapper.OrderMapper;
import com.pinnacle.order.repository.DeliveryPartnerRepository;
import com.pinnacle.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DeliveryService {

    private static final Logger log = LoggerFactory.getLogger(DeliveryService.class);

    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    @Transactional(readOnly = true)
    public List<DeliveryPartner> listPartners() {
        return deliveryPartnerRepository.findAll();
    }

    /**
     * Assigns a delivery partner to an order by id. If partnerId is null the fastest available
     * partner is auto-assigned. Persists the order and returns the updated response.
     */
    public OrderResponse assignToOrder(Long orderId, Long partnerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        if (partnerId != null) {
            assignSpecific(order, partnerId);
        } else if (!autoAssign(order)) {
            throw new BadRequestException("No available delivery partner with spare capacity");
        }
        return orderMapper.toResponse(orderRepository.save(order));
    }

    /**
     * Picks the ACTIVE partner with the smallest avgDeliveryHours that still has spare capacity
     * and assigns it to the given order (mutating the order fields). Returns true if assigned.
     * The caller is responsible for persisting the order.
     */
    public boolean autoAssign(Order order) {
        List<DeliveryPartner> candidates = deliveryPartnerRepository.findByActiveTrueOrderByAvgDeliveryHoursAsc();
        for (DeliveryPartner partner : candidates) {
            if (partner.getCurrentLoad() < partner.getCapacity()) {
                assignPartnerToOrder(order, partner);
                return true;
            }
        }
        log.warn("No available delivery partner with spare capacity for order ID: {}", order.getId());
        return false;
    }

    /**
     * Assigns a specific partner to the order. The caller is responsible for persisting the order.
     */
    public void assignSpecific(Order order, Long partnerId) {
        DeliveryPartner partner = deliveryPartnerRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found with id: " + partnerId));
        assignPartnerToOrder(order, partner);
    }

    private void assignPartnerToOrder(Order order, DeliveryPartner partner) {
        order.setDeliveryPartnerId(partner.getId());
        order.setDeliveryPartnerName(partner.getName());
        order.setEstimatedDeliveryAt(Instant.now().plus(partner.getAvgDeliveryHours(), ChronoUnit.HOURS));
        order.setTrackingStatus("ASSIGNED");
        partner.setCurrentLoad(partner.getCurrentLoad() + 1);
        deliveryPartnerRepository.save(partner);
        log.info("Assigned delivery partner '{}' (id={}) to order ID: {}", partner.getName(), partner.getId(), order.getId());
    }
}
