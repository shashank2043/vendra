package com.pinnacle.report.client;

import com.pinnacle.report.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "review-service")
public interface ReviewClient {

    @GetMapping("/api/v1/reviews")
    ApiResponse<List<Map<String, Object>>> getReviews(
            @RequestParam("vendorId") String vendorId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles);
}
