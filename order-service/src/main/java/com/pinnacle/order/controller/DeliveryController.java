package com.pinnacle.order.controller;

import com.pinnacle.order.dto.ApiResponse;
import com.pinnacle.order.dto.OrderResponse;
import com.pinnacle.order.entity.DeliveryPartner;
import com.pinnacle.order.service.DeliveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/delivery")
@RequiredArgsConstructor
@Tag(name = "Delivery Controller", description = "Delivery partners and assignment")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping
    @Operation(summary = "List delivery partners")
    public ResponseEntity<ApiResponse<List<DeliveryPartner>>> list() {
        return ResponseEntity.ok(ApiResponse.success(deliveryService.listPartners(), "Delivery partners retrieved successfully"));
    }

    @PostMapping("/assign/{orderId}")
    @Operation(summary = "Assign a delivery partner to an order (fastest available if partnerId omitted)")
    public ResponseEntity<ApiResponse<OrderResponse>> assign(
            @PathVariable("orderId") Long orderId,
            @RequestParam(value = "partnerId", required = false) Long partnerId) {

        OrderResponse response = deliveryService.assignToOrder(orderId, partnerId);
        return ResponseEntity.ok(ApiResponse.success(response, "Delivery partner assigned successfully"));
    }
}
