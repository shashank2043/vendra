package com.pinnacle.user.controller;

import com.pinnacle.user.dto.AdminUserResponse;
import com.pinnacle.user.dto.AdminUserUpdateRequest;
import com.pinnacle.user.dto.ApiResponse;
import com.pinnacle.user.exception.BadRequestException;
import com.pinnacle.user.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin User Controller", description = "Administrative management of all users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "List all users (Admin only)")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> listUsers(
            @RequestHeader("X-User-Roles") String roles) {
        requireAdmin(roles);
        return ResponseEntity.ok(ApiResponse.success(adminUserService.listUsers(), "Users retrieved"));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Suspend or reactivate a user (Admin only)")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUser(
            @PathVariable("id") Long id,
            @RequestBody AdminUserUpdateRequest request,
            @RequestHeader("X-User-Roles") String roles) {
        requireAdmin(roles);
        boolean suspended = request != null && Boolean.TRUE.equals(request.getSuspended());
        return ResponseEntity.ok(ApiResponse.success(
                adminUserService.setSuspended(id, suspended),
                suspended ? "User suspended" : "User reactivated"));
    }

    private void requireAdmin(String roles) {
        if (roles == null || !roles.toLowerCase().contains("admin")) {
            throw new BadRequestException("Access denied: only administrators can perform this action");
        }
    }
}
