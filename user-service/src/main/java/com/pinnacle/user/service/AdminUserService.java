package com.pinnacle.user.service;

import com.pinnacle.user.dto.AdminUserResponse;

import java.util.List;

public interface AdminUserService {
    List<AdminUserResponse> listUsers();
    AdminUserResponse setSuspended(Long id, boolean suspended);
}
