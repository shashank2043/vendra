package com.pinnacle.product.mapper;

import com.pinnacle.product.document.Product;
import com.pinnacle.product.dto.ProductRequest;
import com.pinnacle.product.dto.ProductResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    ProductResponse toResponse(Product product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "approved", ignore = true)
    @Mapping(target = "moderationComment", ignore = true)
    @Mapping(target = "vendorId", ignore = true)
    @Mapping(target = "version", ignore = true)
    Product toEntity(ProductRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "approved", ignore = true)
    @Mapping(target = "moderationComment", ignore = true)
    @Mapping(target = "vendorId", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntityFromRequest(ProductRequest request, @MappingTarget Product product);

    List<ProductResponse> toResponseList(List<Product> products);
}
