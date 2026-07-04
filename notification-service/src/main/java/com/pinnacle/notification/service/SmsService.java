package com.pinnacle.notification.service;

public interface SmsService {
    boolean sendSms(String phoneNumber, String message);
}
