package com.pinnacle.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private String id;
    private String productId;
    private String vendorId;
    private String userId;
    private String userName;
    private int rating;
    private String comment;
    private String reply;
    private Instant createdAt;
}
