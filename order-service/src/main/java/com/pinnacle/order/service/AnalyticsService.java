package com.pinnacle.order.service;

import com.pinnacle.order.entity.Order;
import com.pinnacle.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Aggregates order data into the analytics payload consumed by the vendor
 * Analytics dashboard (salesOverTime, categoryBreakdown) and nested by report-service.
 * When vendorId is null/blank the aggregation is platform-wide.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    // Orders in these states are not counted as realised sales / revenue.
    private static final Set<String> NON_SALE_STATUSES = Set.of("CANCELLED", "FAILED");

    private final OrderRepository orderRepository;

    public Map<String, Object> analytics(String vendorId) {
        String vendorFilter = (vendorId != null && !vendorId.isBlank()) ? vendorId : null;
        List<Order> orders = orderRepository.search(null, vendorFilter, null);

        List<Order> sales = orders.stream()
                .filter(o -> o.getStatus() == null || !NON_SALE_STATUSES.contains(o.getStatus()))
                .collect(Collectors.toList());

        BigDecimal totalRevenue = sales.stream()
                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Sales over time: revenue grouped by day, chronologically ordered (TreeMap).
        Map<LocalDate, BigDecimal> byDate = new TreeMap<>();
        for (Order o : sales) {
            if (o.getCreatedAt() == null) {
                continue;
            }
            LocalDate day = o.getCreatedAt().toLocalDate();
            BigDecimal amount = o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO;
            byDate.merge(day, amount, BigDecimal::add);
        }
        List<Map<String, Object>> salesOverTime = byDate.entrySet().stream()
                .map(e -> {
                    Map<String, Object> point = new LinkedHashMap<>();
                    point.put("date", e.getKey().toString());
                    point.put("sales", e.getValue());
                    return point;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalOrders", orders.size());
        result.put("totalSales", sales.size());
        result.put("totalRevenue", totalRevenue);
        result.put("salesOverTime", salesOverTime);
        // Category breakdown needs product categories that live in product-service; the
        // dashboard renders an empty-state gracefully when this list is empty.
        result.put("categoryBreakdown", new ArrayList<>());
        return result;
    }
}
