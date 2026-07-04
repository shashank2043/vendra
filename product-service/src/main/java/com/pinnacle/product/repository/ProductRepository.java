package com.pinnacle.product.repository;

import com.pinnacle.product.document.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByVendorId(String vendorId);
    List<Product> findByApprovedTrue();
    List<Product> findByCategoryAndApprovedTrue(String category);
}
