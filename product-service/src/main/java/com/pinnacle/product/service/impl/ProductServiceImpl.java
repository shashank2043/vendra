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
    private final com.pinnacle.product.service.ImageEmbedder imageEmbedder;

    @Override
    public ProductResponse createProduct(ProductRequest request, String vendorId) {
        Product product = productMapper.toEntity(request);
        product.setVendorId(vendorId);
        product.setApproved(false); // New products require moderation
        product.setModerationStatus("PENDING");
        embedImages(product);
        applyPrimaryImage(product);

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

        // Vendors can freely edit their own listing details; editing does NOT send the
        // product back through admin moderation (approval status is preserved).
        productMapper.updateEntityFromRequest(request, product);
        embedImages(product);
        applyPrimaryImage(product);

        Product savedProduct = productRepository.save(product);
        return productMapper.toResponse(savedProduct);
    }

    // Fetch remote image URLs server-side and inline them as data URIs (best-effort), so
    // they render in the browser even when hotlink/CORS/proxy blocks direct loading.
    private void embedImages(Product product) {
        product.setImageUrls(imageEmbedder.embedAll(product.getImageUrls()));
        product.setImageUrl(imageEmbedder.embed(product.getImageUrl()));
    }

    // Keep the single `imageUrl` (used by cart/order/list thumbnails) in sync with the
    // first of the uploaded images when the caller only provided the gallery list.
    private void applyPrimaryImage(Product product) {
        boolean noPrimary = product.getImageUrl() == null || product.getImageUrl().isBlank();
        if (noPrimary && product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
            product.setImageUrl(product.getImageUrls().get(0));
        }
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
