package com.pinnacle.inventory.client;

import com.pinnacle.inventory.dto.StockUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "product-service")
public interface ProductServiceClient {

    // PUT (not PATCH): Feign's default JDK HTTP client cannot send PATCH requests.
    @PutMapping("/api/v1/products/{id}/stock")
    void updateStock(@PathVariable("id") String id, @RequestBody StockUpdateRequest body);
}
