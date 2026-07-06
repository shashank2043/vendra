package com.pinnacle.user.service;

import com.pinnacle.user.dto.VendorResponse;
import com.pinnacle.user.dto.VendorUpdateRequest;

import java.util.List;

public interface VendorService {
    List<VendorResponse> listVendors(String approvalStatus);
    VendorResponse getVendor(String idOrUsername);
    VendorResponse approveVendor(String idOrUsername);
    VendorResponse rejectVendor(String idOrUsername, String reason);
    VendorResponse updateVendor(String idOrUsername, VendorUpdateRequest request);
    List<VendorResponse> topVendors(int limit);
    List<VendorResponse> featuredNewVendors();
}
