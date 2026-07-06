package com.pinnacle.notification.service;

import com.pinnacle.notification.dto.NotificationRequest;
import com.pinnacle.notification.exception.ResourceNotFoundException;
import com.pinnacle.notification.dto.NotificationDto;
import com.pinnacle.notification.entity.Notification;
import com.pinnacle.notification.mapper.NotificationMapper;
import com.pinnacle.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final EmailService emailService;
    private final SmsService smsService;
    private final PushNotificationService pushNotificationService;
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    public NotificationServiceImpl(EmailService emailService,
                                   SmsService smsService,
                                   PushNotificationService pushNotificationService,
                                   NotificationRepository notificationRepository,
                                   NotificationMapper notificationMapper) {
        this.emailService = emailService;
        this.smsService = smsService;
        this.pushNotificationService = pushNotificationService;
        this.notificationRepository = notificationRepository;
        this.notificationMapper = notificationMapper;
    }

    @Override
    public NotificationDto sendNotification(NotificationRequest request) {
        String type = request.getType() != null ? request.getType().toUpperCase() : "EMAIL";

        // Only attempt external dispatch when a recipient is present (legacy behavior).
        boolean sent = true;
        LocalDateTime sentAt = null;
        if (StringUtils.hasText(request.getRecipient())) {
            String content = request.getBody() != null ? request.getBody() : request.getMessage();
            switch (type) {
                case "EMAIL":
                    sent = emailService.sendEmail(request.getRecipient(), request.getSubject(), content);
                    break;
                case "SMS":
                    sent = smsService.sendSms(request.getRecipient(), content);
                    break;
                case "PUSH":
                    String title = request.getSubject() != null ? request.getSubject() : "Notification";
                    sent = pushNotificationService.sendPushNotification(request.getRecipient(), title, content);
                    break;
                default:
                    sent = false;
                    break;
            }
            sentAt = LocalDateTime.now();
        }

        Notification notification = Notification.builder()
                .recipient(request.getRecipient())
                .subject(request.getSubject())
                .body(request.getBody())
                .type(type)
                .status(sent ? "SENT" : "FAILED")
                .sentAt(sentAt)
                .role(request.getRole())
                .userId(request.getUserId())
                .message(request.getMessage())
                .read(false)
                .createdAt(Instant.now())
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        return notificationMapper.toDto(savedNotification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationHistory(String recipient) {
        List<Notification> notifications = notificationRepository.findByRecipient(recipient);
        return notificationMapper.toDtoList(notifications);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(String role, String userId) {
        List<Notification> notifications;
        boolean hasRole = StringUtils.hasText(role);
        boolean hasUserId = StringUtils.hasText(userId);

        if (hasRole && hasUserId) {
            notifications = notificationRepository.findByRoleAndUserIdOrderByCreatedAtDesc(role, userId);
        } else if (hasRole) {
            notifications = notificationRepository.findByRoleOrderByCreatedAtDesc(role);
        } else if (hasUserId) {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else {
            notifications = notificationRepository.findAllByOrderByCreatedAtDesc();
        }
        return notificationMapper.toDtoList(notifications);
    }

    @Override
    public NotificationDto markRead(Long id, boolean read) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        notification.setRead(read);
        Notification saved = notificationRepository.save(notification);
        return notificationMapper.toDto(saved);
    }
}
