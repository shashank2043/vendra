package com.pinnacle.payment.controller;

import com.pinnacle.payment.dto.ApiResponse;
import com.pinnacle.payment.dto.CreatePaymentRequest;
import com.pinnacle.payment.dto.CreatePaymentResponse;
import com.pinnacle.payment.dto.PaymentResponse;
import com.pinnacle.payment.dto.VerifyPaymentRequest;
import com.pinnacle.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Payment Controller", description = "Endpoints to create, verify and query Razorpay payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    @Operation(summary = "Create a Razorpay order for a given business order")
    public ResponseEntity<ApiResponse<CreatePaymentResponse>> createOrder(
            @Valid @RequestBody CreatePaymentRequest request) {
        CreatePaymentResponse result = paymentService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "Payment order created successfully"));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify a Razorpay payment signature and mark the payment PAID/FAILED")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request) {
        PaymentResponse result = paymentService.verifyPayment(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Payment verification completed"));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get the latest payment for a given business order id")
    public ResponseEntity<ApiResponse<PaymentResponse>> getByOrderId(@PathVariable String orderId) {
        PaymentResponse result = paymentService.getByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(result, "Payment retrieved successfully"));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Razorpay webhook receiver (no user role checks)")
    public ResponseEntity<ApiResponse<String>> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        String result = paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok(ApiResponse.success(result, "Webhook received"));
    }
}
