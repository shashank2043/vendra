package com.pinnacle.product.service;

import com.pinnacle.product.dto.ProductRequest;
import com.pinnacle.product.dto.ProductResponse;

import java.util.List;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request, String vendorId);
    ProductResponse updateProduct(String id, ProductRequest request, String vendorId);
    void deleteProduct(String id, String vendorId);
    ProductResponse getProductById(String id);
    List<ProductResponse> getAllApprovedProducts(String category);
    List<ProductResponse> getProductsByVendor(String vendorId);
    ProductResponse moderateProduct(String id, boolean approved, String comment);
}
