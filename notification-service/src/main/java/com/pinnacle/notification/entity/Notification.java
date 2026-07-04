package com.pinnacle.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String recipient;

    @Column
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column
    private String type; // EMAIL, SMS, PUSH

    @Column
    private String status; // PENDING, SENT, FAILED

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    // ---- Vendra extension fields (frontend depends on these exact names) ----

    @Column
    private String role; // CUSTOMER, VENDOR, ADMIN

    @Column(name = "user_id")
    private String userId;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read")
    @Builder.Default
    private boolean read = false;

    @Column(name = "created_at")
    private Instant createdAt;
}
