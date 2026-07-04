package com.pinnacle.order.mapper;

import com.pinnacle.order.entity.Order;
import com.pinnacle.order.entity.OrderItem;
import com.pinnacle.order.dto.OrderItemResponse;
import com.pinnacle.order.dto.OrderResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "total", source = "totalAmount")
    OrderResponse toResponse(Order order);

    OrderItemResponse toItemResponse(OrderItem item);

    List<OrderResponse> toResponseList(List<Order> orders);
}
