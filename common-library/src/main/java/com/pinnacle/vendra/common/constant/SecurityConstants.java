package com.pinnacle.vendra.common.constant;

public final class SecurityConstants {
    private SecurityConstants() {
        // Private constructor to prevent instantiation
    }

    public static final String HEADER_STRING = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
    
    // Access token valid for 15 minutes (900,000 milliseconds)
    public static final long ACCESS_TOKEN_EXPIRATION = 900_000;
    
    // Refresh token valid for 7 days (604,800,000 milliseconds)
    public static final long REFRESH_TOKEN_EXPIRATION = 604_800_000;
}
