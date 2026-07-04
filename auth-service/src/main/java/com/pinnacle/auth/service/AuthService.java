package com.pinnacle.auth.service;

import com.pinnacle.auth.dto.*;

public interface AuthService {
    UserDto register(RegisterRequest request);
    UserDto registerCustomer(CustomerRegisterRequest request);
    UserDto registerVendor(VendorRegisterRequest request);
    void updateActivation(Long id, boolean enabled);
    
    LoginResponse login(LoginRequest request);
    TokenRefreshResponse refreshToken(String refreshToken);
    void logout(String refreshToken);
    UserDto getUserProfile(String username);
}
