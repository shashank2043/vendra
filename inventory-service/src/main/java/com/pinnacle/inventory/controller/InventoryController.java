package com.pinnacle.inventory.controller;

import com.pinnacle.inventory.dto.ApiResponse;
import com.pinnacle.inventory.dto.InventoryRequest;
import com.pinnacle.inventory.dto.InventoryResponse;
import com.pinnacle.inventory.exception.BadRequestException;
import com.pinnacle.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory Controller", description = "Endpoints for vendor stock management and checks")
public class InventoryController {

    private final InventoryService inventoryService;

    private void validateRole(String rolesHeader, String requiredRole) {
        if (rolesHeader == null || !rolesHeader.toLowerCase().contains(requiredRole.toLowerCase())) {
            throw new BadRequestException("Access denied: missing required role " + requiredRole);
        }
    }

    @PostMapping
    @Operation(summary = "Update product stock quantity (Vendor only)")
    public ResponseEntity<ApiResponse<InventoryResponse>> updateStock(
            @Valid @RequestBody InventoryRequest request,
            @RequestHeader("X-User-Name") String username,
            @RequestHeader("X-User-Roles") String roles) {
        
        validateRole(roles, "vendor");
        InventoryResponse response = inventoryService.updateStock(request, username);
        return ResponseEntity.ok(ApiResponse.success(response, "Stock updated successfully"));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get stock by product ID")
    public ResponseEntity<ApiResponse<InventoryResponse>> getStockByProductId(@PathVariable String productId) {
        InventoryResponse response = inventoryService.getStockByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success(response, "Stock retrieved successfully"));
    }

    @GetMapping("/my-stock")
    @Operation(summary = "Get list of vendor inventory stock levels")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getMyStock(
            @RequestHeader("X-User-Name") String username,
            @RequestHeader("X-User-Roles") String roles) {
        
        validateRole(roles, "vendor");
        List<InventoryResponse> response = inventoryService.getStockByVendor(username);
        return ResponseEntity.ok(ApiResponse.success(response, "Vendor stock levels retrieved successfully"));
    }
}
