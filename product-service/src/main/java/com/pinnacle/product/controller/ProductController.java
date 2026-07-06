package com.pinnacle.product.controller;

import com.pinnacle.product.dto.ApiResponse;
import com.pinnacle.product.dto.ProductRequest;
import com.pinnacle.product.dto.ProductResponse;
import com.pinnacle.product.dto.StockUpdateRequest;
import com.pinnacle.product.exception.BadRequestException;
import com.pinnacle.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product Controller", description = "Endpoints for managing products, including moderation and onboarding")
public class ProductController {

    private final ProductService productService;

    private void validateRole(String rolesHeader, String requiredRole) {
        if (rolesHeader == null || !rolesHeader.toLowerCase().contains(requiredRole.toLowerCase())) {
            throw new BadRequestException("Access denied: missing required role " + requiredRole);
        }
    }

    @PostMapping
    @Operation(summary = "Onboard a new product (Vendor only)")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request,
            @RequestHeader("X-User-Name") String username,
            @RequestHeader("X-User-Roles") String roles) {
        
        validateRole(roles, "vendor");
        ProductResponse response = productService.createProduct(request, username);
        return new ResponseEntity<>(ApiResponse.success(response, "Product submitted for moderation successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing product (Vendor only)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable("id") String id,
            @Valid @RequestBody ProductRequest request,
            @RequestHeader("X-User-Name") String username,
            @RequestHeader("X-User-Roles") String roles) {
        
        validateRole(roles, "vendor");
        ProductResponse response = productService.updateProduct(id, request, username);
        return ResponseEntity.ok(ApiResponse.success(response, "Product updated and resubmitted for moderation"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a product (Vendor only)")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable("id") String id,
            @RequestHeader("X-User-Name") String username,
            @RequestHeader("X-User-Roles") String roles) {
        
        validateRole(roles, "vendor");
        productService.deleteProduct(id, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable("id") String id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Product retrieved successfully"));
    }

    @GetMapping
    @Operation(summary = "List products with optional vendorId, category and approved filters")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProducts(
            @RequestParam(required = false) String vendorId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean approved) {
        List<ProductResponse> response = productService.getProducts(vendorId, category, approved);
        return ResponseEntity.ok(ApiResponse.success(response, "Products retrieved successfully"));
    }

    @PatchMapping("/{id}/stock")
    @Operation(summary = "Internal: update denormalized product stock (service-to-service)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStock(
            @PathVariable("id") String id,
            @RequestBody StockUpdateRequest request) {
        ProductResponse response = productService.updateStock(id, request.getStock());
        return ResponseEntity.ok(ApiResponse.success(response, "Product stock updated successfully"));
    }

    @GetMapping("/my-products")
    @Operation(summary = "List vendor owned products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getMyProducts(
            @RequestHeader("X-User-Name") String username,
            @RequestHeader("X-User-Roles") String roles) {
        
        validateRole(roles, "vendor");
        List<ProductResponse> response = productService.getProductsByVendor(username);
        return ResponseEntity.ok(ApiResponse.success(response, "Vendor products retrieved successfully"));
    }

    @PostMapping("/{id}/moderate")
    @Operation(summary = "Moderate product approval status (Admin only)")
    public ResponseEntity<ApiResponse<ProductResponse>> moderateProduct(
            @PathVariable("id") String id,
            @RequestParam boolean approved,
            @RequestParam(required = false) String comment,
            @RequestHeader("X-User-Roles") String roles) {
        
        validateRole(roles, "admin");
        ProductResponse response = productService.moderateProduct(id, approved, comment);
        return ResponseEntity.ok(ApiResponse.success(response, "Product moderation updated successfully"));
    }
}
