package com.pinnacle.user.controller;

import com.pinnacle.user.dto.ApiResponse;
import com.pinnacle.user.dto.VendorRejectRequest;
import com.pinnacle.user.dto.VendorResponse;
import com.pinnacle.user.dto.VendorUpdateRequest;
import com.pinnacle.user.exception.BadRequestException;
import com.pinnacle.user.service.VendorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vendors")
@RequiredArgsConstructor
@Tag(name = "Vendor Controller", description = "Vendor listing, moderation, trust ranking and discovery")
public class VendorController {

    private final VendorService vendorService;

    @GetMapping
    @Operation(summary = "List vendors, optionally filtered by approvalStatus")
    public ResponseEntity<ApiResponse<List<VendorResponse>>> listVendors(
            @RequestParam(value = "approvalStatus", required = false) String approvalStatus) {
        return ResponseEntity.ok(ApiResponse.success(vendorService.listVendors(approvalStatus), "Vendors retrieved"));
    }

    @GetMapping("/top")
    @Operation(summary = "Top performing vendors ranked by trust score")
    public ResponseEntity<ApiResponse<List<VendorResponse>>> topVendors(
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(vendorService.topVendors(limit), "Top vendors retrieved"));
    }

    @GetMapping("/featured-new")
    @Operation(summary = "New vendors boosted for visibility, ordered by trust score")
    public ResponseEntity<ApiResponse<List<VendorResponse>>> featuredNew() {
        return ResponseEntity.ok(ApiResponse.success(vendorService.featuredNewVendors(), "Featured new vendors retrieved"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single vendor")
    public ResponseEntity<ApiResponse<VendorResponse>> getVendor(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.success(vendorService.getVendor(id), "Vendor retrieved"));
    }

    @PutMapping("/{id}/approve")
    @Operation(summary = "Approve a vendor (Admin only)")
    public ResponseEntity<ApiResponse<VendorResponse>> approve(
            @PathVariable("id") String id,
            @RequestHeader("X-User-Roles") String roles) {
        requireAdmin(roles);
        return ResponseEntity.ok(ApiResponse.success(vendorService.approveVendor(id), "Vendor approved"));
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Reject a vendor with a reason (Admin only)")
    public ResponseEntity<ApiResponse<VendorResponse>> reject(
            @PathVariable("id") String id,
            @RequestBody VendorRejectRequest request,
            @RequestHeader("X-User-Roles") String roles) {
        requireAdmin(roles);
        return ResponseEntity.ok(ApiResponse.success(
                vendorService.rejectVendor(id, request == null ? null : request.getReason()), "Vendor rejected"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update vendor details")
    public ResponseEntity<ApiResponse<VendorResponse>> update(
            @PathVariable("id") String id,
            @RequestBody VendorUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(vendorService.updateVendor(id, request), "Vendor updated"));
    }

    private void requireAdmin(String roles) {
        if (roles == null || !roles.toLowerCase().contains("admin")) {
            throw new BadRequestException("Access denied: only administrators can perform this action");
        }
    }
}
