package com.pinnacle.notification.controller;

import com.pinnacle.notification.dto.ApiResponse;
import com.pinnacle.notification.dto.MarkReadRequest;
import com.pinnacle.notification.dto.NotificationRequest;
import com.pinnacle.notification.dto.NotificationDto;
import com.pinnacle.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notification Controller", description = "Endpoints to dispatch notifications and check delivery history")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    @Operation(summary = "Send/create a new notification")
    public ResponseEntity<ApiResponse<NotificationDto>> sendNotification(@Valid @RequestBody NotificationRequest request) {
        NotificationDto result = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "Notification dispatched successfully"));
    }

    @GetMapping
    @Operation(summary = "List notifications filtered by role and/or userId (newest first)")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String userId) {
        List<NotificationDto> notifications = notificationService.getNotifications(role, userId);
        return ResponseEntity.ok(ApiResponse.success(notifications, "Notifications retrieved successfully"));
    }

    @GetMapping("/history/{recipient}")
    @Operation(summary = "Get notification history for a recipient")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getHistory(@PathVariable String recipient) {
        List<NotificationDto> history = notificationService.getNotificationHistory(recipient);
        return ResponseEntity.ok(ApiResponse.success(history, "History retrieved successfully"));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Mark a notification as read/unread")
    public ResponseEntity<ApiResponse<NotificationDto>> markRead(@PathVariable Long id,
                                                                 @RequestBody MarkReadRequest request) {
        NotificationDto result = notificationService.markRead(id, request.isRead());
        return ResponseEntity.ok(ApiResponse.success(result, "Notification updated successfully"));
    }
}
