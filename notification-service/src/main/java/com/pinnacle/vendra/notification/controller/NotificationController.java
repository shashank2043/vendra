package com.pinnacle.vendra.notification.controller;

import com.pinnacle.vendra.common.dto.ApiResponse;
import com.pinnacle.vendra.common.dto.NotificationRequest;
import com.pinnacle.vendra.notification.dto.NotificationDto;
import com.pinnacle.vendra.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
    @Operation(summary = "Send a new notification (email, sms, or push)")
    public ResponseEntity<ApiResponse<NotificationDto>> sendNotification(@Valid @RequestBody NotificationRequest request) {
        NotificationDto result = notificationService.sendNotification(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Notification dispatched successfully"));
    }

    @GetMapping("/history/{recipient}")
    @Operation(summary = "Get notification history for a recipient")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getHistory(@PathVariable String recipient) {
        List<NotificationDto> history = notificationService.getNotificationHistory(recipient);
        return ResponseEntity.ok(ApiResponse.success(history, "History retrieved successfully"));
    }
}
