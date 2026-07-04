package com.pinnacle.report.controller;

import com.pinnacle.report.client.OrderClient;
import com.pinnacle.report.client.ReviewClient;
import com.pinnacle.report.client.UserClient;
import com.pinnacle.report.dto.ApiResponse;
import com.pinnacle.report.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private static final Logger log = LoggerFactory.getLogger(ReportController.class);

    private final OrderClient orderClient;
    private final UserClient userClient;
    private final ReviewClient reviewClient;

    public ReportController(OrderClient orderClient, UserClient userClient, ReviewClient reviewClient) {
        this.orderClient = orderClient;
        this.userClient = userClient;
        this.reviewClient = reviewClient;
    }

    /**
     * Vendor report: combines the vendor's order analytics, trust score and review stats.
     * Requires role "vendor" or "admin" via the X-User-Roles header.
     */
    @GetMapping("/vendor")
    public ApiResponse<Map<String, Object>> vendorReport(
            @RequestParam("vendorId") String vendorId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        requireAnyRole(roles, "vendor", "admin");

        Map<String, Object> report = new LinkedHashMap<>();
        List<String> errors = new ArrayList<>();
        report.put("vendorId", vendorId);

        // Order analytics
        try {
            ApiResponse<Map<String, Object>> analytics = orderClient.getAnalytics(vendorId, roles);
            report.put("analytics", analytics != null ? analytics.getData() : null);
        } catch (Exception ex) {
            log.warn("Failed to fetch analytics for vendor {}: {}", vendorId, ex.getMessage());
            report.put("analytics", null);
            errors.add("analytics: " + ex.getMessage());
        }

        // Trust score
        try {
            ApiResponse<Map<String, Object>> trust = userClient.getTrustScore(vendorId, roles);
            report.put("trustScore", trust != null ? trust.getData() : null);
        } catch (Exception ex) {
            log.warn("Failed to fetch trust score for vendor {}: {}", vendorId, ex.getMessage());
            report.put("trustScore", null);
            errors.add("trustScore: " + ex.getMessage());
        }

        // Reviews summary
        try {
            ApiResponse<List<Map<String, Object>>> reviews = reviewClient.getReviews(vendorId, roles);
            List<Map<String, Object>> reviewList = reviews != null ? reviews.getData() : null;
            Map<String, Object> reviewSummary = new LinkedHashMap<>();
            if (reviewList != null) {
                reviewSummary.put("count", reviewList.size());
                reviewSummary.put("averageRating", averageRating(reviewList));
            } else {
                reviewSummary.put("count", 0);
                reviewSummary.put("averageRating", null);
            }
            report.put("reviews", reviewSummary);
        } catch (Exception ex) {
            log.warn("Failed to fetch reviews for vendor {}: {}", vendorId, ex.getMessage());
            report.put("reviews", null);
            errors.add("reviews: " + ex.getMessage());
        }

        report.put("errors", errors);
        return ApiResponse.success(report, "Vendor report generated");
    }

    /**
     * Admin report: aggregates all orders (count + total revenue), vendor count,
     * and each vendor with its trust score. Requires role "admin".
     */
    @GetMapping("/admin")
    public ApiResponse<Map<String, Object>> adminReport(
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        requireAnyRole(roles, "admin");

        Map<String, Object> report = new LinkedHashMap<>();
        List<String> errors = new ArrayList<>();

        // Orders summary
        try {
            ApiResponse<List<Map<String, Object>>> orders = orderClient.getAllOrders(roles);
            List<Map<String, Object>> orderList = orders != null ? orders.getData() : null;
            Map<String, Object> orderSummary = new LinkedHashMap<>();
            if (orderList != null) {
                orderSummary.put("count", orderList.size());
                orderSummary.put("totalRevenue", totalRevenue(orderList));
            } else {
                orderSummary.put("count", 0);
                orderSummary.put("totalRevenue", 0.0);
            }
            report.put("orders", orderSummary);
        } catch (Exception ex) {
            log.warn("Failed to fetch orders: {}", ex.getMessage());
            report.put("orders", null);
            errors.add("orders: " + ex.getMessage());
        }

        // Vendors + trust scores
        try {
            ApiResponse<List<Map<String, Object>>> vendors = userClient.getVendors(roles);
            List<Map<String, Object>> vendorList = vendors != null ? vendors.getData() : null;
            report.put("vendorCount", vendorList != null ? vendorList.size() : 0);

            List<Map<String, Object>> vendorsWithScores = new ArrayList<>();
            if (vendorList != null) {
                for (Map<String, Object> vendor : vendorList) {
                    Map<String, Object> entry = new LinkedHashMap<>(vendor);
                    Object vendorId = vendor.get("id") != null ? vendor.get("id") : vendor.get("vendorId");
                    try {
                        if (vendorId != null) {
                            ApiResponse<Map<String, Object>> trust =
                                    userClient.getTrustScore(String.valueOf(vendorId), roles);
                            entry.put("trustScore", trust != null ? trust.getData() : null);
                        } else {
                            entry.put("trustScore", null);
                        }
                    } catch (Exception ex) {
                        log.warn("Failed to fetch trust score for vendor {}: {}", vendorId, ex.getMessage());
                        entry.put("trustScore", null);
                        errors.add("trustScore[" + vendorId + "]: " + ex.getMessage());
                    }
                    vendorsWithScores.add(entry);
                }
            }
            report.put("vendors", vendorsWithScores);
        } catch (Exception ex) {
            log.warn("Failed to fetch vendors: {}", ex.getMessage());
            report.put("vendorCount", 0);
            report.put("vendors", null);
            errors.add("vendors: " + ex.getMessage());
        }

        report.put("errors", errors);
        return ApiResponse.success(report, "Admin report generated");
    }

    // ----- helpers -----

    private void requireAnyRole(String roles, String... allowed) {
        if (roles == null || roles.isBlank()) {
            throw new ApiException("Missing X-User-Roles header", HttpStatus.FORBIDDEN);
        }
        String lower = roles.toLowerCase();
        for (String role : allowed) {
            if (lower.contains(role.toLowerCase())) {
                return;
            }
        }
        throw new ApiException("Insufficient role to access this report", HttpStatus.FORBIDDEN);
    }

    private Double averageRating(List<Map<String, Object>> reviews) {
        double sum = 0.0;
        int n = 0;
        for (Map<String, Object> review : reviews) {
            Object rating = review.get("rating");
            if (rating instanceof Number number) {
                sum += number.doubleValue();
                n++;
            }
        }
        return n == 0 ? null : sum / n;
    }

    private double totalRevenue(List<Map<String, Object>> orders) {
        double total = 0.0;
        for (Map<String, Object> order : orders) {
            Object amount = order.get("totalAmount");
            if (amount == null) {
                amount = order.get("amount");
            }
            if (amount instanceof Number number) {
                total += number.doubleValue();
            }
        }
        return total;
    }
}
