package com.pinnacle.vendra.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SmsServiceImpl implements SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsServiceImpl.class);

    @Override
    public boolean sendSms(String phoneNumber, String message) {
        log.info("Sending SMS - To: {}, Message: {}", phoneNumber, message);
        // Add actual integration code here during the Vendra (e.g. Twilio)
        return true;
    }
}
