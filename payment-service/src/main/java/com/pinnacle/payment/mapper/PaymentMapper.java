package com.pinnacle.payment.mapper;

import com.pinnacle.payment.dto.PaymentResponse;
import com.pinnacle.payment.entity.Payment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    PaymentResponse toResponse(Payment payment);
}
