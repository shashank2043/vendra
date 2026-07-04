package com.pinnacle.vendra.notification.mapper;

import com.pinnacle.vendra.notification.entity.Notification;
import com.pinnacle.vendra.notification.dto.NotificationDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationDto toDto(Notification notification);
    List<NotificationDto> toDtoList(List<Notification> notifications);
}
