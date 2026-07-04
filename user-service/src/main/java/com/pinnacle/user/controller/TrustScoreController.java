package com.pinnacle.user.controller;

import com.pinnacle.user.dto.ApiResponse;
import com.pinnacle.user.dto.TrustScoreResponse;
import com.pinnacle.user.exception.BadRequestException;
import com.pinnacle.user.service.TrustScoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trust-scores")
@RequiredArgsConstructor
@Tag(name = "Trust Score Controller", description = "Vendor trust scores, badges and ranking")
public class TrustScoreController {

    private final TrustScoreService trustScoreService;

    @GetMapping
    @Operation(summary = "Get trust score for one vendor (vendorId) or all vendors ranked")
    public ResponseEntity<ApiResponse<?>> getTrustScores(
            @RequestParam(value = "vendorId", required = false) Long vendorId) {
        if (vendorId != null) {
            TrustScoreResponse response = trustScoreService.getForVendor(vendorId);
            return ResponseEntity.ok(ApiResponse.success(response, "Trust score retrieved"));
        }
        List<TrustScoreResponse> all = trustScoreService.getAllRanked();
        return ResponseEntity.ok(ApiResponse.success(all, "Trust scores retrieved"));
    }

    @PostMapping("/recompute")
    @Operation(summary = "Manually trigger trust score recomputation (Admin only)")
    public ResponseEntity<ApiResponse<Void>> recompute(
            @RequestHeader("X-User-Roles") String roles) {
        if (roles == null || !roles.toLowerCase().contains("admin")) {
            throw new BadRequestException("Access denied: only administrators can trigger recomputation");
        }
        trustScoreService.recomputeAll();
        return ResponseEntity.ok(ApiResponse.success(null, "Trust score recomputation triggered"));
    }
}
