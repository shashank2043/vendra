package com.pinnacle.user.mapper;

import com.pinnacle.user.entity.UserProfile;
import com.pinnacle.user.dto.UserProfileCreateRequest;
import com.pinnacle.user.dto.UserProfileResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    UserProfile toEntity(UserProfileCreateRequest request);
    UserProfileResponse toResponse(UserProfile profile);
}
