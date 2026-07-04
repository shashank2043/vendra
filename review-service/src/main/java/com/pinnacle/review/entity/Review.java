package com.pinnacle.review.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("reviews")
public class Review {
    @Id
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
