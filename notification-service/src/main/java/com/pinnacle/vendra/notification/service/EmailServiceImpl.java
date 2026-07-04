package com.pinnacle.vendra.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Override
    public boolean sendEmail(String to, String subject, String body) {
        log.info("Sending Email - To: {}, Subject: {}, Body: {}", to, subject, body);
        // Add actual integration code here during the Vendra (e.g. JavaMailSender, SendGrid)
        return true;
    }
}
