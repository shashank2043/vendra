package com.pinnacle.order.controller;

import com.pinnacle.order.dto.ApiResponse;
import com.pinnacle.order.dto.CommissionLedgerResponse;
import com.pinnacle.order.dto.CommissionRuleRequest;
import com.pinnacle.order.dto.CommissionRuleResponse;
import com.pinnacle.order.entity.CommissionLedger;
import com.pinnacle.order.entity.CommissionRule;
import com.pinnacle.order.exception.BadRequestException;
import com.pinnacle.order.exception.ResourceNotFoundException;
import com.pinnacle.order.service.CommissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@RestController
@RequestMapping("/api/v1/commission")
@RequiredArgsConstructor
@Tag(name = "Commission Controller", description = "Commission rule management and vendor earnings ledger")
public class CommissionController {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final CommissionService commissionService;

    private void validateRole(String rolesHeader, String requiredRole) {
        if (rolesHeader == null || !rolesHeader.toLowerCase().contains(requiredRole.toLowerCase())) {
            throw new BadRequestException("Access denied: missing required role " + requiredRole);
        }
    }

    @GetMapping("/rules")
    @Operation(summary = "List all commission rules")
    public ResponseEntity<ApiResponse<List<CommissionRuleResponse>>> listRules() {
        List<CommissionRuleResponse> rules = commissionService.listRules().stream()
                .map(this::toRuleResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(rules, "Commission rules retrieved successfully"));
    }

    @PostMapping("/rules")
    @Operation(summary = "Create a commission rule (Admin only)")
    public ResponseEntity<ApiResponse<CommissionRuleResponse>> createRule(
            @RequestBody CommissionRuleRequest request,
            @RequestHeader("X-User-Roles") String roles) {

        validateRole(roles, "admin");
        CommissionRule rule = commissionService.createRule(
                request.getCategoryName(),
                toPercent(request.getCommissionRate()),
                request.getActive());
        return ResponseEntity.ok(ApiResponse.success(toRuleResponse(rule), "Commission rule created successfully"));
    }

    @PatchMapping("/rules/{id}")
    @Operation(summary = "Update a commission rule (Admin only)")
    public ResponseEntity<ApiResponse<CommissionRuleResponse>> updateRule(
            @PathVariable("id") Long id,
            @RequestBody CommissionRuleRequest request,
            @RequestHeader("X-User-Roles") String roles) {

        validateRole(roles, "admin");
        CommissionRule rule = commissionService.updateRule(
                id,
                request.getCategoryName(),
                toPercent(request.getCommissionRate()),
                request.getActive());
        if (rule == null) {
            throw new ResourceNotFoundException("Commission rule not found with id: " + id);
        }
        return ResponseEntity.ok(ApiResponse.success(toRuleResponse(rule), "Commission rule updated successfully"));
    }

    @GetMapping("/ledger")
    @Operation(summary = "Get the commission ledger, optionally filtered by vendor")
    public ResponseEntity<ApiResponse<List<CommissionLedgerResponse>>> getLedger(
            @RequestParam(value = "vendorId", required = false) String vendorId) {

        List<CommissionLedgerResponse> ledger = commissionService.getLedger(vendorId).stream()
                .map(this::toLedgerResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(ledger, "Commission ledger retrieved successfully"));
    }

    // ---- mapping helpers: entity uses 0..100 percent, frontend uses 0..1 fraction ----

    private BigDecimal toPercent(BigDecimal fraction) {
        return fraction != null ? fraction.multiply(HUNDRED) : null;
    }

    private CommissionRuleResponse toRuleResponse(CommissionRule rule) {
        BigDecimal fraction = rule.getRatePercent() != null
                ? rule.getRatePercent().divide(HUNDRED, 6, RoundingMode.HALF_UP)
                : null;
        return CommissionRuleResponse.builder()
                .id(rule.getId())
                .categoryName(rule.getCategory())
                .commissionRate(fraction)
                .active(rule.isActive())
                .build();
    }

    private CommissionLedgerResponse toLedgerResponse(CommissionLedger ledger) {
        BigDecimal gross = ledger.getOrderAmount();
        BigDecimal commission = ledger.getCommissionAmount();
        BigDecimal rate = (gross != null && gross.signum() != 0 && commission != null)
                ? commission.divide(gross, 6, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        return CommissionLedgerResponse.builder()
                .id(ledger.getId())
                .vendorId(ledger.getVendorId())
                .orderId(ledger.getOrderId())
                .grossSales(gross)
                .commissionRate(rate)
                .commissionDeducted(commission)
                .netPayout(ledger.getNetAmount())
                .createdAt(ledger.getCreatedAt())
                .build();
    }
}
