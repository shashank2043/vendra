package com.pinnacle.report.client;

import com.pinnacle.report.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping("/api/v1/vendors")
    ApiResponse<List<Map<String, Object>>> getVendors(
            @RequestHeader(value = "X-User-Roles", required = false) String roles);

    @GetMapping("/api/v1/trust-scores")
    ApiResponse<Map<String, Object>> getTrustScore(
            @RequestParam("vendorId") String vendorId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles);
}
