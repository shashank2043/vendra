package com.pinnacle.order.scheduler;

import com.pinnacle.order.entity.Order;
import com.pinnacle.order.repository.OrderRepository;
import com.pinnacle.order.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * Priority-based delayed order processing: advances CONFIRMED orders to PROCESSING in priority
 * order (VIP > PREMIUM > STANDARD, then oldest first) and auto-assigns a delivery partner.
 */
@Component
@RequiredArgsConstructor
public class OrderProcessor {

    private static final Logger log = LoggerFactory.getLogger(OrderProcessor.class);

    private static final Map<String, Integer> PRIORITY_RANK = Map.of(
            "VIP", 3,
            "PREMIUM", 2,
            "STANDARD", 1);

    private final OrderRepository orderRepository;
    private final DeliveryService deliveryService;

    @Scheduled(fixedDelayString = "${order.processor.interval-ms:60000}")
    @Transactional
    public void process() {
        List<Order> confirmed = orderRepository.findByStatus("CONFIRMED");
        if (confirmed.isEmpty()) {
            return;
        }

        confirmed.sort(Comparator
                .comparingInt((Order o) -> PRIORITY_RANK.getOrDefault(
                        o.getPriority() == null ? "STANDARD" : o.getPriority().toUpperCase(), 1))
                .reversed()
                .thenComparing(o -> o.getCreatedAt() == null ? LocalDateTime.MAX : o.getCreatedAt()));

        log.info("OrderProcessor: advancing {} CONFIRMED order(s) to PROCESSING by priority", confirmed.size());
        for (Order order : confirmed) {
            order.setStatus("PROCESSING");
            if (order.getDeliveryPartnerId() == null) {
                deliveryService.autoAssign(order);
            }
            orderRepository.save(order);
            log.info("OrderProcessor: order ID {} (priority={}) -> PROCESSING, partner={}",
                    order.getId(), order.getPriority(), order.getDeliveryPartnerName());
        }
    }
}
