package com.pinnacle.vendra.notification.service;

public interface EmailService {
    boolean sendEmail(String to, String subject, String body);
}
