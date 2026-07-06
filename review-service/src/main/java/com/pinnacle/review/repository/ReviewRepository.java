package com.pinnacle.review.repository;

import com.pinnacle.review.entity.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProductId(String productId);

    List<Review> findByVendorId(String vendorId);
}
