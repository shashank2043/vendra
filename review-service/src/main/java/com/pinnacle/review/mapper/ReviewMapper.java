package com.pinnacle.review.mapper;

import com.pinnacle.review.dto.ReviewResponse;
import com.pinnacle.review.entity.Review;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    ReviewResponse toResponse(Review review);

    List<ReviewResponse> toResponseList(List<Review> reviews);
}
