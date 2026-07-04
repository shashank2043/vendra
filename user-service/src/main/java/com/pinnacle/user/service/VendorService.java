package com.pinnacle.user.service;

import com.pinnacle.user.dto.VendorResponse;
import com.pinnacle.user.dto.VendorUpdateRequest;

import java.util.List;

public interface VendorService {
    List<VendorResponse> listVendors(String approvalStatus);
    VendorResponse getVendor(Long id);
    VendorResponse approveVendor(Long id);
    VendorResponse rejectVendor(Long id, String reason);
    VendorResponse updateVendor(Long id, VendorUpdateRequest request);
    List<VendorResponse> topVendors(int limit);
    List<VendorResponse> featuredNewVendors();
}
