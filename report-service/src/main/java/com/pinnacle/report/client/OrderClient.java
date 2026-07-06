package com.pinnacle.report.client;

import com.pinnacle.report.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "order-service")
public interface OrderClient {

    @GetMapping("/api/v1/orders")
    ApiResponse<List<Map<String, Object>>> getAllOrders(
            @RequestHeader(value = "X-User-Roles", required = false) String roles);

    @GetMapping("/api/v1/analytics")
    ApiResponse<Map<String, Object>> getAnalytics(
            @RequestParam("vendorId") String vendorId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles);
}
