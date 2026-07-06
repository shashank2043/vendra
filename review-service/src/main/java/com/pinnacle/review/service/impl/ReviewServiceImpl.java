package com.pinnacle.review.service.impl;

import com.pinnacle.review.dto.ReviewRequest;
import com.pinnacle.review.dto.ReviewResponse;
import com.pinnacle.review.entity.Review;
import com.pinnacle.review.exception.ResourceNotFoundException;
import com.pinnacle.review.mapper.ReviewMapper;
import com.pinnacle.review.repository.ReviewRepository;
import com.pinnacle.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    @Override
    public ReviewResponse createReview(ReviewRequest request, String userName) {
        Review review = Review.builder()
                .productId(request.getProductId())
                .vendorId(request.getVendorId())
                .userId(userName)
                .userName(userName)
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(Instant.now())
                .build();
        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Override
    public List<ReviewResponse> getByProduct(String productId) {
        return reviewMapper.toResponseList(reviewRepository.findByProductId(productId));
    }

    @Override
    public List<ReviewResponse> getByVendor(String vendorId) {
        return reviewMapper.toResponseList(reviewRepository.findByVendorId(vendorId));
    }

    @Override
    public List<ReviewResponse> getAll() {
        return reviewMapper.toResponseList(reviewRepository.findAll());
    }

    @Override
    public ReviewResponse getById(String id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id " + id));
        return reviewMapper.toResponse(review);
    }

    @Override
    public ReviewResponse addReply(String id, String reply) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id " + id));
        review.setReply(reply);
        return reviewMapper.toResponse(reviewRepository.save(review));
    }
}
