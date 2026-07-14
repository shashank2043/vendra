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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product Controller", description = "Endpoints for product catalogue, vendor listings and moderation")
public class ProductController {

    private final ProductService productService;

    private void validateRole(String rolesHeader, String requiredRole) {
        if (rolesHeader == null || !rolesHeader.toLowerCase().contains(requiredRole.toLowerCase())) {
            throw new BadRequestException("Access denied: missing required role " + requiredRole);
        }
    }

    @GetMapping
    @Operation(summary = "List products (storefront, vendor catalogue or moderation queue)")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProducts(
            @RequestParam(value = "vendorId", required = false) String vendorId,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "approved", required = false) Boolean approved) {

        List<ProductResponse> response = productService.getProducts(vendorId, category, approved);
        return ResponseEntity.ok(ApiResponse.success(response, "Products retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single product by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable("id") String id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Product retrieved successfully"));
    }

    @PostMapping
    @Operation(summary = "Create a new product (Vendor only)")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request,
            @RequestHeader("X-User-Name") String username,
            @RequestHeader("X-User-Roles") String roles) {

        validateRole(roles, "vendor");
        ProductResponse response = productService.createProduct(request, username);
        return ResponseEntity.ok(ApiResponse.success(response, "Product submitted for moderation"));
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
        return ResponseEntity.ok(ApiResponse.success(response, "Product updated successfully"));
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

    @PostMapping("/{id}/moderate")
    @Operation(summary = "Approve or reject a product (Admin only)")
    public ResponseEntity<ApiResponse<ProductResponse>> moderateProduct(
            @PathVariable("id") String id,
            @RequestParam("approved") boolean approved,
            @RequestParam(value = "comment", required = false) String comment,
            @RequestHeader("X-User-Roles") String roles) {

        validateRole(roles, "admin");
        ProductResponse response = productService.moderateProduct(id, approved, comment);
        return ResponseEntity.ok(ApiResponse.success(response, "Product moderation updated"));
    }

    @PutMapping("/{id}/stock")
    @Operation(summary = "Update product stock (internal, called by inventory-service)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStock(
            @PathVariable("id") String id,
            @RequestBody StockUpdateRequest body) {

        ProductResponse response = productService.updateStock(id, body.getStock());
        return ResponseEntity.ok(ApiResponse.success(response, "Stock updated successfully"));
    }
}
