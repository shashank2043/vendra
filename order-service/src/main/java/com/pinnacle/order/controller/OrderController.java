package com.pinnacle.order.controller;

import com.pinnacle.order.dto.ApiResponse;
import com.pinnacle.order.dto.OrderRequest;
import com.pinnacle.order.dto.OrderResponse;
import com.pinnacle.order.exception.BadRequestException;
import com.pinnacle.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order Controller", description = "Endpoints for placing checkouts and tracking order lifecycle")
public class OrderController {

    private final OrderService orderService;

    private void validateRole(String rolesHeader, String requiredRole) {
        if (rolesHeader == null || !rolesHeader.toLowerCase().contains(requiredRole.toLowerCase())) {
            throw new BadRequestException("Access denied: missing required role " + requiredRole);
        }
    }

    @PostMapping
    @Operation(summary = "Submit a checkout request for order processing")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest request,
            @RequestHeader("X-User-Name") String username,
            @RequestHeader("X-User-Roles") String roles) {
        
        // Customers are allowed to check out
        validateRole(roles, "customer");
        OrderResponse response = orderService.createOrder(request, username);
        return new ResponseEntity<>(ApiResponse.success(response, "Checkout request received; processing order status"), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable("id") Long id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Order retrieved successfully"));
    }

    @GetMapping("/my-orders")
    @Operation(summary = "List all orders placed by the current customer")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @RequestHeader("X-User-Name") String username,
            @RequestHeader("X-User-Roles") String roles) {
        
        validateRole(roles, "customer");
        List<OrderResponse> response = orderService.getOrdersByCustomer(username);
        return ResponseEntity.ok(ApiResponse.success(response, "Customer orders retrieved successfully"));
    }
}
