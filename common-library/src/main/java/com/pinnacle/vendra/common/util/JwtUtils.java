package com.pinnacle.vendra.common.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtils {

    @Value("${jwt.secret:3c9073b83c13df425f187a2a0efc684345ff48cb6c17e3f28cf085b8823ff23f}")
    private String secret;

    @Value("${keycloak.auth-server-url:http://localhost:8080}")
    private String keycloakUrl;

    @Value("${keycloak.realm:vendra}")
    private String realm;

    private static PublicKey cachedPublicKey = null;

    private SecretKey getSigningKey() {
        byte[] keyBytes = this.secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private synchronized PublicKey getPublicKey() {
        if (cachedPublicKey != null) {
            return cachedPublicKey;
        }
        try {
            String url = keycloakUrl + "/realms/" + realm;
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                String body = response.body();
                String searchStr = "\"public_key\":\"";
                int start = body.indexOf(searchStr);
                if (start != -1) {
                    int end = body.indexOf("\"", start + searchStr.length());
                    String publicKeyString = body.substring(start + searchStr.length(), end);
                    byte[] keyBytes = Base64.getDecoder().decode(publicKeyString.trim());
                    X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
                    KeyFactory kf = KeyFactory.getInstance("RSA");
                    cachedPublicKey = kf.generatePublic(spec);
                    return cachedPublicKey;
                }
            }
        } catch (Exception e) {
            // Keep cachedPublicKey null to retry next time
        }
        return null;
    }

    public String extractUsername(String token) {
        Claims claims = extractAllClaims(token);
        String preferredUsername = claims.get("preferred_username", String.class);
        if (preferredUsername != null && !preferredUsername.isBlank()) {
            return preferredUsername;
        }
        return claims.getSubject();
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        // Try realm_access.roles first (Keycloak)
        Map<String, Object> realmAccess = claims.get("realm_access", Map.class);
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            return (List<String>) realmAccess.get("roles");
        }
        return claims.get("roles", List.class);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        PublicKey publicKey = getPublicKey();
        if (publicKey != null) {
            return Jwts.parser()
                    .verifyWith(publicKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        }
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(String username, List<String> roles, long expirationMs) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", roles);
        return createToken(claims, username, expirationMs);
    }

    private String createToken(Map<String, Object> claims, String subject, long expirationMs) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    public Boolean validateToken(String token) {
        try {
            PublicKey publicKey = getPublicKey();
            if (publicKey != null) {
                Jwts.parser().verifyWith(publicKey).build().parseSignedClaims(token);
            } else {
                Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            }
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}
