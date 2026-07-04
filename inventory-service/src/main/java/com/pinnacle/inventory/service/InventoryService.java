package com.pinnacle.inventory.service;

import com.pinnacle.inventory.dto.InventoryRequest;
import com.pinnacle.inventory.dto.InventoryResponse;

import java.util.List;

public interface InventoryService {
    InventoryResponse updateStock(InventoryRequest request, String vendorId);
    InventoryResponse getStockByProductId(String productId);
    List<InventoryResponse> getStockByVendor(String vendorId);
    boolean reserveStock(String productId, int quantity);
}
