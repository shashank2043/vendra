package com.pinnacle.order.controller;

import com.pinnacle.order.dto.ApiResponse;
import com.pinnacle.order.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics Controller", description = "Sales and order analytics for vendors and admins")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @Operation(summary = "Analytics for a vendor, or platform-wide when no vendorId is given")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analytics(
            @RequestParam(value = "vendorId", required = false) String vendorId) {

        Map<String, Object> data = analyticsService.analytics(vendorId);
        return ResponseEntity.ok(ApiResponse.success(data, "Analytics computed successfully"));
    }
}
