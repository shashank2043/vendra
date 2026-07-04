package com.pinnacle.user.client;

import com.pinnacle.user.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {

    @PutMapping("/auth/users/{id}/activation")
    ApiResponse<Void> updateActivation(
            @PathVariable("id") Long id,
            @RequestParam("enabled") boolean enabled
    );
}
