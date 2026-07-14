package com.pinnacle.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String vendorId;
    private String category;
    private String imageUrl;
    private List<String> imageUrls;
    private Integer stock;
    private Map<String, Object> attributes;
    private boolean approved;
    private String moderationStatus;
    private String moderationFeedback;
}
