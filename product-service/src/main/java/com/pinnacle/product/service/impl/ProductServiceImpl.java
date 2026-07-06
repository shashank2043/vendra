package com.pinnacle.product.service.impl;

import com.pinnacle.product.document.Product;
import com.pinnacle.product.dto.ProductRequest;
import com.pinnacle.product.dto.ProductResponse;
import com.pinnacle.product.exception.BadRequestException;
import com.pinnacle.product.exception.ResourceNotFoundException;
import com.pinnacle.product.mapper.ProductMapper;
import com.pinnacle.product.repository.ProductRepository;
import com.pinnacle.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductResponse createProduct(ProductRequest request, String vendorId) {
        Product product = productMapper.toEntity(request);
        product.setVendorId(vendorId);
        product.setApproved(false); // Pending moderation
        product.setModerationStatus("PENDING");

        Product savedProduct = productRepository.save(product);
        return productMapper.toResponse(savedProduct);
    }

    @Override
    public ProductResponse updateProduct(String id, ProductRequest request, String vendorId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        if (!product.getVendorId().equals(vendorId)) {
            throw new BadRequestException("You do not own this product");
        }

        productMapper.updateEntityFromRequest(request, product);
        product.setApproved(false); // Reset approval status after edits
        product.setModerationStatus("PENDING");

        Product savedProduct = productRepository.save(product);
        return productMapper.toResponse(savedProduct);
    }

    @Override
    public void deleteProduct(String id, String vendorId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        if (!product.getVendorId().equals(vendorId)) {
            throw new BadRequestException("You do not own this product");
        }

        productRepository.delete(product);
    }

    @Override
    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return productMapper.toResponse(product);
    }

    @Override
    public List<ProductResponse> getAllApprovedProducts(String category) {
        List<Product> products;
        if (category != null && !category.isBlank()) {
            products = productRepository.findByCategoryAndApprovedTrue(category);
        } else {
            products = productRepository.findByApprovedTrue();
        }
        return productMapper.toResponseList(products);
    }

    @Override
    public List<ProductResponse> getProducts(String vendorId, String category, Boolean approved) {
        boolean hasCategory = category != null && !category.isBlank();
        List<Product> products;
        if (vendorId != null && !vendorId.isBlank()) {
            // A specific vendor's catalogue - include unapproved items
            products = hasCategory
                    ? productRepository.findByVendorIdAndCategory(vendorId, category)
                    : productRepository.findByVendorId(vendorId);
        } else if (Boolean.FALSE.equals(approved)) {
            // Admin moderation view - include unapproved (all products)
            products = hasCategory
                    ? productRepository.findByCategory(category)
                    : productRepository.findAll();
        } else {
            // Storefront - approved products only
            products = hasCategory
                    ? productRepository.findByCategoryAndApprovedTrue(category)
                    : productRepository.findByApprovedTrue();
        }
        return productMapper.toResponseList(products);
    }

    @Override
    public List<ProductResponse> getProductsByVendor(String vendorId) {
        List<Product> products = productRepository.findByVendorId(vendorId);
        return productMapper.toResponseList(products);
    }

    @Override
    public ProductResponse moderateProduct(String id, boolean approved, String comment) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        product.setApproved(approved);
        product.setModerationComment(comment);
        product.setModerationFeedback(comment);
        product.setModerationStatus(approved ? "APPROVED" : "REJECTED");

        Product savedProduct = productRepository.save(product);
        return productMapper.toResponse(savedProduct);
    }

    @Override
    public ProductResponse updateStock(String id, Integer stock) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setStock(stock);
        Product savedProduct = productRepository.save(product);
        return productMapper.toResponse(savedProduct);
    }
}
