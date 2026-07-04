package com.pinnacle.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String recipient;
    private String subject;
    private String body;
    private String type;
    private String status;
    private LocalDateTime sentAt;
}
