package com.pinnacle.payment.service;

import com.pinnacle.payment.dto.CreatePaymentRequest;
import com.pinnacle.payment.dto.CreatePaymentResponse;
import com.pinnacle.payment.dto.PaymentResponse;
import com.pinnacle.payment.dto.VerifyPaymentRequest;

public interface PaymentService {
    CreatePaymentResponse createOrder(CreatePaymentRequest request);
    PaymentResponse verifyPayment(VerifyPaymentRequest request);
    PaymentResponse getByOrderId(String orderId);
    String handleWebhook(String payload, String signature);
}
