package com.pinnacle.inventory.service.impl;

import com.pinnacle.inventory.entity.Inventory;
import com.pinnacle.inventory.dto.InventoryRequest;
import com.pinnacle.inventory.dto.InventoryResponse;
import com.pinnacle.inventory.exception.ResourceNotFoundException;
import com.pinnacle.inventory.mapper.InventoryMapper;
import com.pinnacle.inventory.repository.InventoryRepository;
import com.pinnacle.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    public InventoryResponse updateStock(InventoryRequest request, String vendorId) {
        Optional<Inventory> existing = inventoryRepository.findByProductId(request.getProductId());
        Inventory inventory;
        if (existing.isPresent()) {
            inventory = existing.get();
            inventory.setQuantity(request.getQuantity());
        } else {
            inventory = inventoryMapper.toEntity(request);
            inventory.setVendorId(vendorId);
        }
        Inventory saved = inventoryRepository.save(inventory);
        return inventoryMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getStockByProductId(String productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("No inventory found for product: " + productId));
        return inventoryMapper.toResponse(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getStockByVendor(String vendorId) {
        List<Inventory> inventories = inventoryRepository.findByVendorId(vendorId);
        return inventoryMapper.toResponseList(inventories);
    }

    @Override
    public boolean reserveStock(String productId, int quantity) {
        Optional<Inventory> existing = inventoryRepository.findByProductId(productId);
        if (existing.isEmpty()) {
            return false;
        }
        Inventory inventory = existing.get();
        if (inventory.getQuantity() < quantity) {
            return false;
        }
        // Deduct quantity
        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventoryRepository.save(inventory);
        return true;
    }
}
