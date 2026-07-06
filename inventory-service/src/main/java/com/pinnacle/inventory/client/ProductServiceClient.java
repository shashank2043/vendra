package com.pinnacle.inventory.client;

import com.pinnacle.inventory.dto.StockUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "product-service")
public interface ProductServiceClient {

    @PatchMapping("/api/v1/products/{id}/stock")
    void updateStock(@PathVariable("id") String id, @RequestBody StockUpdateRequest body);
}
