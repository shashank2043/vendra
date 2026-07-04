package com.pinnacle.vendra.auth.service;

import com.pinnacle.vendra.auth.dto.*;
import com.pinnacle.vendra.common.dto.UserDto;

public interface AuthService {
    UserDto register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    TokenRefreshResponse refreshToken(String refreshToken);
    void logout(String refreshToken);
    UserDto getUserProfile(String username);
}
