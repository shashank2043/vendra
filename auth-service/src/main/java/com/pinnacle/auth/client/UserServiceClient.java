package com.pinnacle.auth.client;

import com.pinnacle.auth.dto.ApiResponse;
import com.pinnacle.auth.dto.UserProfileCreateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @PostMapping("/api/v1/users")
    ApiResponse<Object> createProfile(@RequestBody UserProfileCreateRequest request);
}
