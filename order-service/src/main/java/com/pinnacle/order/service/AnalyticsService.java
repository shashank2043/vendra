package com.pinnacle.order.service;

import com.pinnacle.order.entity.Order;
import com.pinnacle.order.entity.OrderItem;
import com.pinnacle.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final int RECENT_DAYS = 7;

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> analytics(String vendorId) {
        List<Order> orders = (vendorId == null || vendorId.isBlank())
                ? orderRepository.findAll()
                : orderRepository.search(null, vendorId, null);

        Map<String, Object> result = new LinkedHashMap<>();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        Map<LocalDate, BigDecimal> revenueByDayMap = new LinkedHashMap<>();
        Map<String, Integer> productQty = new LinkedHashMap<>();

        LocalDate cutoff = LocalDate.now().minusDays(RECENT_DAYS - 1L);

        for (Order order : orders) {
            BigDecimal amount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
            totalRevenue = totalRevenue.add(amount);

            String status = order.getStatus() != null ? order.getStatus() : "UNKNOWN";
            ordersByStatus.merge(status, 1L, Long::sum);

            if (order.getCreatedAt() != null) {
                LocalDate day = order.getCreatedAt().toLocalDate();
                if (!day.isBefore(cutoff)) {
                    revenueByDayMap.merge(day, amount, BigDecimal::add);
                }
            }

            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    productQty.merge(item.getProductId(), item.getQuantity(), Integer::sum);
                }
            }
        }

        List<Map<String, Object>> revenueByDay = new ArrayList<>();
        for (int i = 0; i < RECENT_DAYS; i++) {
            LocalDate day = cutoff.plusDays(i);
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("date", day.toString());
            entry.put("revenue", revenueByDayMap.getOrDefault(day, BigDecimal.ZERO));
            revenueByDay.add(entry);
        }

        List<Map<String, Object>> topProducts = productQty.entrySet().stream()
                .sorted((a, b) -> b.getValue() - a.getValue())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("productId", e.getKey());
                    m.put("quantity", e.getValue());
                    return m;
                })
                .collect(java.util.stream.Collectors.toList());

        result.put("totalOrders", (long) orders.size());
        result.put("totalRevenue", totalRevenue);
        result.put("ordersByStatus", ordersByStatus);
        result.put("revenueByDay", revenueByDay);
        result.put("topProducts", topProducts);
        return result;
    }
}
