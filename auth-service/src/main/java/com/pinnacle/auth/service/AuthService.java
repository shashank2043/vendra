package com.pinnacle.auth.service;

import com.pinnacle.auth.dto.*;
import com.pinnacle.auth.dto.UserDto;

public interface AuthService {
    UserDto register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    TokenRefreshResponse refreshToken(String refreshToken);
    void logout(String refreshToken);
    UserDto getUserProfile(String username);
}
