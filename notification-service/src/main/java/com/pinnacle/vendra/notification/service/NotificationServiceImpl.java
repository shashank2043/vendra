package com.pinnacle.vendra.notification.service;

import com.pinnacle.vendra.common.dto.NotificationRequest;
import com.pinnacle.vendra.common.exception.BadRequestException;
import com.pinnacle.vendra.notification.dto.NotificationDto;
import com.pinnacle.vendra.notification.entity.Notification;
import com.pinnacle.vendra.notification.mapper.NotificationMapper;
import com.pinnacle.vendra.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        boolean sent;
        String type = request.getType() != null ? request.getType().toUpperCase() : "EMAIL";

        switch (type) {
            case "EMAIL":
                sent = emailService.sendEmail(request.getRecipient(), request.getSubject(), request.getBody());
                break;
            case "SMS":
                sent = smsService.sendSms(request.getRecipient(), request.getBody());
                break;
            case "PUSH":
                String title = request.getSubject() != null ? request.getSubject() : "Notification";
                sent = pushNotificationService.sendPushNotification(request.getRecipient(), title, request.getBody());
                break;
            default:
                throw new BadRequestException("Unsupported notification type: " + type);
        }

        Notification notification = Notification.builder()
                .recipient(request.getRecipient())
                .subject(request.getSubject())
                .body(request.getBody())
                .type(type)
                .status(sent ? "SENT" : "FAILED")
                .sentAt(LocalDateTime.now())
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
}
