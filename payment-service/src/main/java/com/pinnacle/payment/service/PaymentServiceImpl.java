package com.pinnacle.payment.service;

import com.pinnacle.payment.config.RazorpayProperties;
import com.pinnacle.payment.dto.CreatePaymentRequest;
import com.pinnacle.payment.dto.CreatePaymentResponse;
import com.pinnacle.payment.dto.PaymentResponse;
import com.pinnacle.payment.dto.VerifyPaymentRequest;
import com.pinnacle.payment.entity.Payment;
import com.pinnacle.payment.exception.BadRequestException;
import com.pinnacle.payment.exception.ResourceNotFoundException;
import com.pinnacle.payment.mapper.PaymentMapper;
import com.pinnacle.payment.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.Instant;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final RazorpayProperties razorpayProperties;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              PaymentMapper paymentMapper,
                              RazorpayProperties razorpayProperties) {
        this.paymentRepository = paymentRepository;
        this.paymentMapper = paymentMapper;
        this.razorpayProperties = razorpayProperties;
    }

    @Override
    public CreatePaymentResponse createOrder(CreatePaymentRequest request) {
        String currency = razorpayProperties.getCurrency();
        // amount in the smallest currency unit (paise) as required by Razorpay
        long amountInPaise = request.getAmount().multiply(BigDecimal.valueOf(100)).longValueExact();

        String razorpayOrderId;
        if (razorpayProperties.isPlaceholder()) {
            log.warn("Razorpay running in PLACEHOLDER mode; generating a mock order id");
            razorpayOrderId = "order_mock_" + System.currentTimeMillis();
        } else {
            try {
                RazorpayClient client = new RazorpayClient(
                        razorpayProperties.getKeyId(), razorpayProperties.getKeySecret());
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", amountInPaise);
                orderRequest.put("currency", currency);
                orderRequest.put("receipt", "rcpt_" + request.getOrderId());
                com.razorpay.Order order = client.orders.create(orderRequest);
                razorpayOrderId = order.get("id");
            } catch (RazorpayException e) {
                log.error("Failed to create Razorpay order", e);
                throw new BadRequestException("Failed to create Razorpay order: " + e.getMessage());
            }
        }

        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .amount(request.getAmount())
                .currency(currency)
                .razorpayOrderId(razorpayOrderId)
                .status("CREATED")
                .createdAt(Instant.now())
                .build();
        payment = paymentRepository.save(payment);

        return CreatePaymentResponse.builder()
                .razorpayOrderId(razorpayOrderId)
                .amount(request.getAmount())
                .currency(currency)
                .keyId(razorpayProperties.getKeyId())
                .paymentDbId(payment.getId())
                .build();
    }

    @Override
    public PaymentResponse verifyPayment(VerifyPaymentRequest request) {
        Payment payment = paymentRepository
                .findFirstByRazorpayOrderIdOrderByCreatedAtDesc(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found for razorpayOrderId: " + request.getRazorpayOrderId()));

        boolean valid;
        if (razorpayProperties.isPlaceholder()) {
            valid = StringUtils.hasText(request.getRazorpaySignature())
                    && StringUtils.hasText(request.getRazorpayPaymentId());
        } else {
            try {
                JSONObject attributes = new JSONObject();
                attributes.put("razorpay_order_id", request.getRazorpayOrderId());
                attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
                attributes.put("razorpay_signature", request.getRazorpaySignature());
                valid = Utils.verifyPaymentSignature(attributes, razorpayProperties.getKeySecret());
            } catch (RazorpayException e) {
                log.error("Failed to verify Razorpay payment signature", e);
                throw new BadRequestException("Failed to verify payment signature: " + e.getMessage());
            }
        }

        if (valid) {
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setStatus("PAID");
        } else {
            payment.setStatus("FAILED");
        }
        payment = paymentRepository.save(payment);

        return paymentMapper.toResponse(payment);
    }

    @Override
    public PaymentResponse getByOrderId(String orderId) {
        Payment payment = paymentRepository
                .findFirstByOrderIdOrderByCreatedAtDesc(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found for orderId: " + orderId));
        return paymentMapper.toResponse(payment);
    }

    @Override
    public String handleWebhook(String payload, String signature) {
        if (!razorpayProperties.isPlaceholder()) {
            try {
                boolean valid = Utils.verifyWebhookSignature(
                        payload, signature, razorpayProperties.getWebhookSecret());
                if (!valid) {
                    throw new BadRequestException("Invalid webhook signature");
                }
            } catch (RazorpayException e) {
                log.error("Failed to verify webhook signature", e);
                throw new BadRequestException("Failed to verify webhook signature: " + e.getMessage());
            }
        }

        try {
            JSONObject event = new JSONObject(payload);
            String eventType = event.optString("event");
            log.info("Received Razorpay webhook event: {}", eventType);

            JSONObject paymentEntity = event
                    .optJSONObject("payload")
                    != null
                    ? event.getJSONObject("payload").optJSONObject("payment")
                    : null;
            if (paymentEntity != null) {
                JSONObject entity = paymentEntity.optJSONObject("entity");
                if (entity != null) {
                    String razorpayOrderId = entity.optString("order_id", null);
                    String razorpayPaymentId = entity.optString("id", null);
                    if (StringUtils.hasText(razorpayOrderId)) {
                        paymentRepository
                                .findFirstByRazorpayOrderIdOrderByCreatedAtDesc(razorpayOrderId)
                                .ifPresent(payment -> {
                                    if (razorpayPaymentId != null) {
                                        payment.setRazorpayPaymentId(razorpayPaymentId);
                                    }
                                    if ("payment.captured".equals(eventType)) {
                                        payment.setStatus("PAID");
                                    } else if ("payment.failed".equals(eventType)) {
                                        payment.setStatus("FAILED");
                                    }
                                    paymentRepository.save(payment);
                                });
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to process webhook payload", e);
            throw new BadRequestException("Failed to process webhook payload: " + e.getMessage());
        }

        return "Webhook processed";
    }
}
