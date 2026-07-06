package com.pinnacle.order.controller;

import com.pinnacle.order.dto.ApiResponse;
import com.pinnacle.order.dto.DisputeRequest;
import com.pinnacle.order.dto.DisputeResponse;
import com.pinnacle.order.dto.DisputeUpdateRequest;
import com.pinnacle.order.exception.BadRequestException;
import com.pinnacle.order.service.DisputeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/disputes")
@RequiredArgsConstructor
@Tag(name = "Dispute Controller", description = "Endpoints for raising and resolving order disputes")
public class DisputeController {

    private final DisputeService disputeService;

    private void validateRole(String rolesHeader, String requiredRole) {
        if (rolesHeader == null || !rolesHeader.toLowerCase().contains(requiredRole.toLowerCase())) {
            throw new BadRequestException("Access denied: missing required role " + requiredRole);
        }
    }

    @GetMapping
    @Operation(summary = "List disputes, optionally filtered by status (admin)")
    public ResponseEntity<ApiResponse<List<DisputeResponse>>> list(
            @RequestParam(value = "status", required = false) String status,
            @RequestHeader("X-User-Roles") String roles) {

        validateRole(roles, "admin");
        return ResponseEntity.ok(ApiResponse.success(disputeService.list(status), "Disputes retrieved successfully"));
    }

    @PostMapping
    @Operation(summary = "Raise a new dispute (customer)")
    public ResponseEntity<ApiResponse<DisputeResponse>> create(
            @Valid @RequestBody DisputeRequest request,
            @RequestHeader("X-User-Roles") String roles) {

        validateRole(roles, "customer");
        DisputeResponse response = disputeService.create(request);
        return new ResponseEntity<>(ApiResponse.success(response, "Dispute created successfully"), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Resolve or escalate a dispute (admin)")
    public ResponseEntity<ApiResponse<DisputeResponse>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody DisputeUpdateRequest request,
            @RequestHeader("X-User-Roles") String roles) {

        validateRole(roles, "admin");
        DisputeResponse response = disputeService.update(id, request.getStatus(), request.getResolutionNotes());
        return ResponseEntity.ok(ApiResponse.success(response, "Dispute updated successfully"));
    }
}
