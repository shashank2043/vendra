package com.pinnacle.product.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String vendorId;
    private String category;
    private String imageUrl;
    private Integer stock;
    private Map<String, Object> attributes;
    private boolean approved;
    private String moderationComment;
    private String moderationStatus;
    private String moderationFeedback;

    @Version
    private Long version;
}
