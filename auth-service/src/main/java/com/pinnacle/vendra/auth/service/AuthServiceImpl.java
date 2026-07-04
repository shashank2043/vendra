package com.pinnacle.vendra.auth.service;

import com.pinnacle.vendra.auth.dto.*;
import com.pinnacle.vendra.auth.entity.RefreshToken;
import com.pinnacle.vendra.auth.entity.Role;
import com.pinnacle.vendra.auth.entity.User;
import com.pinnacle.vendra.auth.mapper.UserMapper;
import com.pinnacle.vendra.auth.repository.RefreshTokenRepository;
import com.pinnacle.vendra.auth.repository.RoleRepository;
import com.pinnacle.vendra.auth.repository.UserRepository;
import com.pinnacle.vendra.common.dto.UserDto;
import com.pinnacle.vendra.common.exception.BadRequestException;
import com.pinnacle.vendra.common.exception.ResourceNotFoundException;
import com.pinnacle.vendra.common.exception.UnauthorizedException;
import com.pinnacle.vendra.common.util.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final UserMapper userMapper;
    private final RestTemplate restTemplate;

    @Value("${keycloak.auth-server-url:http://localhost:8080}")
    private String keycloakAuthServerUrl;

    @Value("${keycloak.realm:vendra}")
    private String keycloakRealm;

    @Value("${keycloak.client-id:vendra-client}")
    private String keycloakClientId;

    @Value("${keycloak.client-secret:vendra-client-secret}")
    private String keycloakClientSecret;

    @Value("${keycloak.admin.username:admin}")
    private String keycloakAdminUsername;

    @Value("${keycloak.admin.password:admin}")
    private String keycloakAdminPassword;

    @Value("${keycloak.admin.client-id:admin-cli}")
    private String keycloakAdminClientId;

    public AuthServiceImpl(UserRepository userRepository,
                            RoleRepository roleRepository,
                            RefreshTokenRepository refreshTokenRepository,
                            PasswordEncoder passwordEncoder,
                            JwtUtils jwtUtils,
                            UserMapper userMapper,
                            RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.userMapper = userMapper;
        this.restTemplate = restTemplate;
    }

    private String getAdminToken() {
        String tokenUrl = String.format("%s/realms/master/protocol/openid-connect/token", keycloakAuthServerUrl);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "password");
        body.add("client_id", keycloakAdminClientId);
        body.add("username", keycloakAdminUsername);
        body.add("password", keycloakAdminPassword);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
        } catch (Exception e) {
            throw new UnauthorizedException("Failed to authenticate Keycloak Admin: " + e.getMessage());
        }
        throw new UnauthorizedException("Failed to retrieve admin token from Keycloak");
    }

    private void registerUserInKeycloak(String username, String email, String password, String role) {
        String adminToken = getAdminToken();
        String createUserUrl = String.format("%s/admin/realms/%s/users", keycloakAuthServerUrl, keycloakRealm);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(adminToken);
        
        // Construct credentials JSON payload
        Map<String, Object> credential = new HashMap<>();
        credential.put("type", "password");
        credential.put("value", password);
        credential.put("temporary", false);
        
        Map<String, Object> userBody = new HashMap<>();
        userBody.put("username", username);
        userBody.put("email", email);
        userBody.put("enabled", true);
        userBody.put("credentials", Collections.singletonList(credential));
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(userBody, headers);
        
        ResponseEntity<Void> response;
        try {
            response = restTemplate.postForEntity(createUserUrl, request, Void.class);
        } catch (HttpClientErrorException.Conflict e) {
            throw new BadRequestException("Username or email already exists in Keycloak");
        } catch (Exception e) {
            throw new BadRequestException("Failed to register user in Keycloak: " + e.getMessage());
        }
        
        if (response.getStatusCode().value() == 201) {
            java.net.URI location = response.getHeaders().getLocation();
            if (location != null) {
                String path = location.getPath();
                String userId = path.substring(path.lastIndexOf('/') + 1);
                assignRoleToKeycloakUser(userId, role, adminToken);
            }
        } else {
            throw new BadRequestException("Failed to register user in identity provider, status: " + response.getStatusCode());
        }
    }

    private void assignRoleToKeycloakUser(String userId, String roleName, String adminToken) {
        // Get Keycloak role representation to find its ID
        String getRoleUrl = String.format("%s/admin/realms/%s/roles/%s", keycloakAuthServerUrl, keycloakRealm, roleName);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(adminToken);
        
        HttpEntity<Void> getRequest = new HttpEntity<>(headers);
        
        Map<String, Object> roleRepresentation = null;
        try {
            ResponseEntity<Map> response = restTemplate.exchange(getRoleUrl, HttpMethod.GET, getRequest, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                roleRepresentation = response.getBody();
            }
        } catch (Exception e) {
            // Role might not exist in Keycloak, log and return
            return;
        }
        
        if (roleRepresentation != null) {
            String mappingUrl = String.format("%s/admin/realms/%s/users/%s/role-mappings/realm", keycloakAuthServerUrl, keycloakRealm, userId);
            HttpEntity<List<Map<String, Object>>> postRequest = new HttpEntity<>(
                    Collections.singletonList(roleRepresentation), headers);
            try {
                restTemplate.postForEntity(mappingUrl, postRequest, Void.class);
            } catch (Exception e) {
                // Log and ignore
            }
        }
    }

    @Override
    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new ResourceNotFoundException("Default Customer Role not found"));

        // Register in Keycloak first
        registerUserInKeycloak(request.getUsername(), request.getEmail(), request.getPassword(), "ROLE_CUSTOMER");

        // Save locally to keep in sync with local DB
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .roles(Set.of(customerRole))
                .build();

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // Authenticate with Keycloak using password grant type
        String tokenUrl = String.format("%s/realms/%s/protocol/openid-connect/token", keycloakAuthServerUrl, keycloakRealm);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "password");
        body.add("client_id", keycloakClientId);
        body.add("client_secret", keycloakClientSecret);
        body.add("username", request.getUsername());
        body.add("password", request.getPassword());
        
        HttpEntity<MultiValueMap<String, String>> formRequest = new HttpEntity<>(body, headers);
        
        Map<String, Object> keycloakResponse;
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, formRequest, Map.class);
            keycloakResponse = response.getBody();
        } catch (HttpClientErrorException e) {
            throw new UnauthorizedException("Invalid username or password");
        } catch (Exception e) {
            throw new UnauthorizedException("Authentication failed: " + e.getMessage());
        }
        
        if (keycloakResponse == null || !keycloakResponse.containsKey("access_token")) {
            throw new UnauthorizedException("Invalid username or password");
        }
        
        String accessToken = (String) keycloakResponse.get("access_token");
        String refreshToken = (String) keycloakResponse.get("refresh_token");
        
        // Fetch local user details
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Authentication succeeded in identity provider but user not found locally"));
        
        if (!user.isEnabled()) {
            throw new UnauthorizedException("User account is disabled");
        }
        
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toDto(user))
                .build();
    }

    @Override
    public TokenRefreshResponse refreshToken(String token) {
        String tokenUrl = String.format("%s/realms/%s/protocol/openid-connect/token", keycloakAuthServerUrl, keycloakRealm);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "refresh_token");
        body.add("client_id", keycloakClientId);
        body.add("client_secret", keycloakClientSecret);
        body.add("refresh_token", token);
        
        HttpEntity<MultiValueMap<String, String>> formRequest = new HttpEntity<>(body, headers);
        
        Map<String, Object> keycloakResponse;
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, formRequest, Map.class);
            keycloakResponse = response.getBody();
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }
        
        if (keycloakResponse == null || !keycloakResponse.containsKey("access_token")) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }
        
        String newAccessToken = (String) keycloakResponse.get("access_token");
        String newRefreshToken = (String) keycloakResponse.get("refresh_token");
        
        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Override
    public void logout(String refreshTokenString) {
        String logoutUrl = String.format("%s/realms/%s/protocol/openid-connect/logout", keycloakAuthServerUrl, keycloakRealm);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", keycloakClientId);
        body.add("client_secret", keycloakClientSecret);
        body.add("refresh_token", refreshTokenString);
        
        HttpEntity<MultiValueMap<String, String>> formRequest = new HttpEntity<>(body, headers);
        
        try {
            restTemplate.postForEntity(logoutUrl, formRequest, Void.class);
        } catch (Exception e) {
            // Ignore if keycloak logout fails or token is already invalid
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return userMapper.toDto(user);
    }
}
