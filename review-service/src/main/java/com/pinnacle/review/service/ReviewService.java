package com.pinnacle.review.service;

import com.pinnacle.review.dto.ReviewRequest;
import com.pinnacle.review.dto.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(ReviewRequest request, String userName);

    List<ReviewResponse> getByProduct(String productId);

    List<ReviewResponse> getByVendor(String vendorId);

    List<ReviewResponse> getAll();

    ReviewResponse getById(String id);

    ReviewResponse addReply(String id, String reply);
}
