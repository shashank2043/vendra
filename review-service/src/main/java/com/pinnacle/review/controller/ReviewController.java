package com.pinnacle.review.controller;

import com.pinnacle.review.dto.ApiResponse;
import com.pinnacle.review.dto.ReviewReplyRequest;
import com.pinnacle.review.dto.ReviewRequest;
import com.pinnacle.review.dto.ReviewResponse;
import com.pinnacle.review.exception.BadRequestException;
import com.pinnacle.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Review Controller", description = "Endpoints for product/vendor reviews and vendor replies")
public class ReviewController {

    private final ReviewService reviewService;

    private void validateRole(String rolesHeader, String requiredRole) {
        if (rolesHeader == null || !rolesHeader.toLowerCase().contains(requiredRole.toLowerCase())) {
            throw new BadRequestException("Access denied: missing required role " + requiredRole);
        }
    }

    @GetMapping
    @Operation(summary = "List reviews, optionally filtered by productId or vendorId")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviews(
            @RequestParam(value = "productId", required = false) String productId,
            @RequestParam(value = "vendorId", required = false) String vendorId) {

        List<ReviewResponse> response;
        if (productId != null && !productId.isBlank()) {
            response = reviewService.getByProduct(productId);
        } else if (vendorId != null && !vendorId.isBlank()) {
            response = reviewService.getByVendor(vendorId);
        } else {
            response = reviewService.getAll();
        }
        return ResponseEntity.ok(ApiResponse.success(response, "Reviews retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a review by ID")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable("id") String id) {
        ReviewResponse response = reviewService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Review retrieved successfully"));
    }

    @PostMapping
    @Operation(summary = "Create a review (customers only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody ReviewRequest request,
            @RequestHeader("X-User-Name") String username,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        validateRole(roles, "customer");
        ReviewResponse response = reviewService.createReview(request, username);
        return new ResponseEntity<>(ApiResponse.success(response, "Review created successfully"), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Reply to a review (vendors only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> replyToReview(
            @PathVariable("id") String id,
            @Valid @RequestBody ReviewReplyRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        validateRole(roles, "vendor");
        ReviewResponse response = reviewService.addReply(id, request.getReply());
        return ResponseEntity.ok(ApiResponse.success(response, "Reply added successfully"));
    }
}
