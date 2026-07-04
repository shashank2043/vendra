package com.pinnacle.notification.mapper;

import com.pinnacle.notification.entity.Notification;
import com.pinnacle.notification.dto.NotificationDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationDto toDto(Notification notification);
    List<NotificationDto> toDtoList(List<Notification> notifications);
}
