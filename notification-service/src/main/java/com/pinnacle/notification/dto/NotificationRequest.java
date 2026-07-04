package com.pinnacle.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    private String recipient;

    private String subject;

    private String body;

    private String type; // EMAIL, SMS, PUSH

    // ---- Vendra extension fields ----
    private String role;    // CUSTOMER, VENDOR, ADMIN

    private String userId;

    private String message;

    private Map<String, Object> metadata;
}
