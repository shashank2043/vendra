package com.pinnacle.auth.controller;

import com.pinnacle.auth.dto.*;
import com.pinnacle.auth.service.AuthService;
import com.pinnacle.auth.constant.SecurityConstants;
import com.pinnacle.auth.dto.ApiResponse;
import com.pinnacle.auth.dto.UserDto;
import com.pinnacle.auth.exception.BadRequestException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication Controller", description = "Endpoints for registration, login, logout, profile and token refresh")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        UserDto registeredUser = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(registeredUser, "User registered successfully"));
    }

    @PostMapping("/register/customer")
    @Operation(summary = "Register a new customer")
    public ResponseEntity<ApiResponse<UserDto>> registerCustomer(@Valid @RequestBody CustomerRegisterRequest request) {
        UserDto registeredUser = authService.registerCustomer(request);
        return ResponseEntity.ok(ApiResponse.success(registeredUser, "Customer registered successfully. Direct login is active."));
    }

    @PostMapping("/register/vendor")
    @Operation(summary = "Register a new vendor (requires admin approval)")
    public ResponseEntity<ApiResponse<UserDto>> registerVendor(@Valid @RequestBody VendorRegisterRequest request) {
        UserDto registeredUser = authService.registerVendor(request);
        return ResponseEntity.ok(ApiResponse.success(registeredUser, "Vendor registration submitted. Please wait for administrator approval before logging in."));
    }

    @PostMapping("/login")
    @Operation(summary = "Login existing user and return tokens")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request, 
                                                            HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request);
        
        // Generate and set HttpOnly refresh token cookie
        ResponseCookie cookie = ResponseCookie.from(SecurityConstants.REFRESH_TOKEN_COOKIE_NAME, loginResponse.getRefreshToken())
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path("/")
                .maxAge(SecurityConstants.REFRESH_TOKEN_EXPIRATION / 1000)
                .sameSite("Lax")
                .build();
        
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        
        return ResponseEntity.ok(ApiResponse.success(loginResponse, "Logged in successfully"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refresh(
            @RequestBody(required = false) TokenRefreshRequest request,
            @CookieValue(name = SecurityConstants.REFRESH_TOKEN_COOKIE_NAME, required = false) String cookieRefreshToken,
            HttpServletResponse response) {
        
        String refreshToken = null;
        if (cookieRefreshToken != null) {
            refreshToken = cookieRefreshToken;
        } else if (request != null) {
            refreshToken = request.getRefreshToken();
        }

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException("Refresh token is missing");
        }

        TokenRefreshResponse refreshResponse = authService.refreshToken(refreshToken);

        // Update refresh token cookie
        ResponseCookie cookie = ResponseCookie.from(SecurityConstants.REFRESH_TOKEN_COOKIE_NAME, refreshResponse.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(SecurityConstants.REFRESH_TOKEN_EXPIRATION / 1000)
                .sameSite("Lax")
                .build();
        
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(ApiResponse.success(refreshResponse, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate refresh token")
    public ResponseEntity<ApiResponse<String>> logout(
            @CookieValue(name = SecurityConstants.REFRESH_TOKEN_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response) {
        
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }

        // Clear refresh token cookie
        ResponseCookie cookie = ResponseCookie.from(SecurityConstants.REFRESH_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserDto>> profile(@RequestHeader(name = "X-User-Name", required = false) String username) {
        if (username == null || username.isBlank()) {
            throw new BadRequestException("User profile requested but no user identifier header found");
        }
        UserDto profile = authService.getUserProfile(username);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved successfully"));
    }

    @PutMapping("/users/{id}/activation")
    @Operation(summary = "Update user activation status (Internal use only)")
    public ResponseEntity<ApiResponse<Void>> updateActivation(
            @PathVariable("id") Long id,
            @RequestParam("enabled") boolean enabled) {
        authService.updateActivation(id, enabled);
        return ResponseEntity.ok(ApiResponse.success(null, "User activation updated successfully"));
    }
}
