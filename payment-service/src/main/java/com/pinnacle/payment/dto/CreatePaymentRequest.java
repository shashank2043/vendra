package com.pinnacle.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentRequest {

    @NotBlank
    private String orderId;

    @NotNull
    @Positive
    private BigDecimal amount;

    // Optional ISO currency the buyer is paying in (e.g. INR, USD). Falls back to the
    // configured Razorpay account currency when absent.
    private String currency;
}
