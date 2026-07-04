package com.pinnacle.vendra.notification.service;

public interface SmsService {
    boolean sendSms(String phoneNumber, String message);
}
