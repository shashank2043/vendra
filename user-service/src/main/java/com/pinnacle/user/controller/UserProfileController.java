package com.pinnacle.user.controller;

import com.pinnacle.user.dto.*;
import com.pinnacle.user.exception.BadRequestException;
import com.pinnacle.user.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Profile Controller", description = "Endpoints for retrieving, updating, and approving user profiles")
public class UserProfileController {

    private final UserProfileService userProfileService;

    @PostMapping
    @Operation(summary = "Create user profile (internal callback for registration)")
    public ResponseEntity<ApiResponse<UserProfileResponse>> createProfile(
            @RequestBody UserProfileCreateRequest request) {
        UserProfileResponse response = userProfileService.createProfile(request);
        return new ResponseEntity<>(ApiResponse.success(response, "Profile created successfully"), HttpStatus.CREATED);
    }

    @GetMapping("/profile")
    @Operation(summary = "Get user profile for currently authenticated user")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @RequestHeader("X-User-Name") String username) {
        UserProfileResponse response = userProfileService.getProfile(username);
        return ResponseEntity.ok(ApiResponse.success(response, "User profile retrieved successfully"));
    }

    @PutMapping("/profile/customer")
    @Operation(summary = "Update customer profile details")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateCustomerProfile(
            @Valid @RequestBody CustomerProfileUpdateRequest request,
            @RequestHeader("X-User-Name") String username,
            @RequestHeader("X-User-Roles") String roles) {

        if (roles == null || !roles.toLowerCase().contains("customer")) {
            throw new BadRequestException("Access denied: only customers can update customer profiles");
        }
        UserProfileResponse response = userProfileService.updateCustomerProfile(request, username);
        return ResponseEntity.ok(ApiResponse.success(response, "Customer profile updated successfully"));
    }

    @PutMapping("/profile/vendor")
    @Operation(summary = "Update vendor profile details (requires admin re-approval)")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateVendorProfile(
            @Valid @RequestBody VendorProfileUpdateRequest request,
            @RequestHeader("X-User-Name") String username,
            @RequestHeader("X-User-Roles") String roles) {

        if (roles == null || !roles.toLowerCase().contains("vendor")) {
            throw new BadRequestException("Access denied: only vendors can update vendor profiles");
        }
        UserProfileResponse response = userProfileService.updateVendorProfile(request, username);
        return ResponseEntity.ok(ApiResponse.success(response, "Vendor profile updated successfully. Your account is temporarily deactivated pending moderation."));
    }

    @PutMapping("/{id}/approve")
    @Operation(summary = "Approve vendor account registration/modification (Admin only)")
    public ResponseEntity<ApiResponse<Void>> approveVendor(
            @PathVariable("id") Long id,
            @RequestHeader("X-User-Roles") String roles) {

        if (roles == null || !roles.toLowerCase().contains("admin")) {
            throw new BadRequestException("Access denied: only administrators can approve vendors");
        }
        userProfileService.approveVendor(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Vendor approved and enabled successfully"));
    }
}
