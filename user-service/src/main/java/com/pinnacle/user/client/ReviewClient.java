package com.pinnacle.user.client;

import com.pinnacle.user.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

/**
 * Feign client for review-service. Service-to-service call; forwards a trusted role header.
 */
@FeignClient(name = "review-service")
public interface ReviewClient {

    @GetMapping("/api/v1/reviews")
    ApiResponse<List<Map<String, Object>>> getReviews(
            @RequestParam("vendorId") String vendorId,
            @RequestHeader("X-User-Roles") String roles
    );
}
