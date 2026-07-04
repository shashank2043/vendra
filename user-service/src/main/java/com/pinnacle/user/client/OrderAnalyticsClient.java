package com.pinnacle.user.client;

import com.pinnacle.user.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

/**
 * Feign client for order-service. These are service-to-service calls that bypass the
 * gateway, so we forward a trusted role header (X-User-Roles) explicitly.
 */
@FeignClient(name = "order-service")
public interface OrderAnalyticsClient {

    @GetMapping("/api/v1/analytics")
    ApiResponse<Map<String, Object>> getAnalytics(
            @RequestParam("vendorId") Long vendorId,
            @RequestHeader("X-User-Roles") String roles
    );

    @GetMapping("/api/v1/orders")
    ApiResponse<List<Map<String, Object>>> getOrders(
            @RequestParam("vendorId") Long vendorId,
            @RequestHeader("X-User-Roles") String roles
    );
}
