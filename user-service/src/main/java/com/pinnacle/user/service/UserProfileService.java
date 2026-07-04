package com.pinnacle.user.service;

import com.pinnacle.user.dto.CustomerProfileUpdateRequest;
import com.pinnacle.user.dto.UserProfileCreateRequest;
import com.pinnacle.user.dto.UserProfileResponse;
import com.pinnacle.user.dto.VendorProfileUpdateRequest;

public interface UserProfileService {
    UserProfileResponse createProfile(UserProfileCreateRequest request);
    UserProfileResponse getProfile(String username);
    UserProfileResponse updateCustomerProfile(CustomerProfileUpdateRequest request, String username);
    UserProfileResponse updateVendorProfile(VendorProfileUpdateRequest request, String username);
    void approveVendor(Long id);
}
