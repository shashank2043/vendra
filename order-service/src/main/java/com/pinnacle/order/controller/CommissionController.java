package com.pinnacle.order.controller;

import com.pinnacle.order.dto.ApiResponse;
import com.pinnacle.order.dto.CommissionRuleRequest;
import com.pinnacle.order.entity.CommissionLedger;
import com.pinnacle.order.entity.CommissionRule;
import com.pinnacle.order.exception.BadRequestException;
import com.pinnacle.order.exception.ResourceNotFoundException;
import com.pinnacle.order.service.CommissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/commission")
@RequiredArgsConstructor
@Tag(name = "Commission Controller", description = "Commission rules and vendor earnings ledger")
public class CommissionController {

    private final CommissionService commissionService;

    private void validateRole(String rolesHeader, String requiredRole) {
        if (rolesHeader == null || !rolesHeader.toLowerCase().contains(requiredRole.toLowerCase())) {
            throw new BadRequestException("Access denied: missing required role " + requiredRole);
        }
    }

    @GetMapping("/rules")
    @Operation(summary = "List commission rules (admin)")
    public ResponseEntity<ApiResponse<List<CommissionRule>>> listRules(
            @RequestHeader("X-User-Roles") String roles) {
        validateRole(roles, "admin");
        return ResponseEntity.ok(ApiResponse.success(commissionService.listRules(), "Commission rules retrieved successfully"));
    }

    @PostMapping("/rules")
    @Operation(summary = "Create a commission rule (admin)")
    public ResponseEntity<ApiResponse<CommissionRule>> createRule(
            @RequestBody CommissionRuleRequest request,
            @RequestHeader("X-User-Roles") String roles) {
        validateRole(roles, "admin");
        CommissionRule rule = commissionService.createRule(request.getCategory(), request.getRatePercent(), request.getActive());
        return new ResponseEntity<>(ApiResponse.success(rule, "Commission rule created successfully"), HttpStatus.CREATED);
    }

    @PatchMapping("/rules/{id}")
    @Operation(summary = "Update a commission rule (admin)")
    public ResponseEntity<ApiResponse<CommissionRule>> updateRule(
            @PathVariable("id") Long id,
            @RequestBody CommissionRuleRequest request,
            @RequestHeader("X-User-Roles") String roles) {
        validateRole(roles, "admin");
        CommissionRule rule = commissionService.updateRule(id, request.getCategory(), request.getRatePercent(), request.getActive());
        if (rule == null) {
            throw new ResourceNotFoundException("Commission rule not found with id: " + id);
        }
        return ResponseEntity.ok(ApiResponse.success(rule, "Commission rule updated successfully"));
    }

    @GetMapping("/ledger")
    @Operation(summary = "Vendor earnings ledger (filter by vendorId)")
    public ResponseEntity<ApiResponse<List<CommissionLedger>>> ledger(
            @RequestParam(value = "vendorId", required = false) String vendorId) {
        return ResponseEntity.ok(ApiResponse.success(commissionService.getLedger(vendorId), "Commission ledger retrieved successfully"));
    }
}
