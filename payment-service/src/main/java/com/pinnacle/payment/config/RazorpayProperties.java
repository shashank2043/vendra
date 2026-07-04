package com.pinnacle.payment.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "razorpay")
public class RazorpayProperties {
    private String keyId;
    private String keySecret;
    private String currency = "INR";
    private String webhookSecret;

    /**
     * Placeholder mode is active when no real Razorpay key has been configured.
     * In this mode the service never calls out to Razorpay and uses mock values.
     */
    public boolean isPlaceholder() {
        return keyId == null || keyId.startsWith("rzp_test_placeholder");
    }
}
