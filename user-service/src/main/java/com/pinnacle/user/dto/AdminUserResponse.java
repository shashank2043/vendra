package com.pinnacle.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private Long id;
    private String email;
    private String name;   // username
    private String role;
    private Boolean suspended; // = !enabled
    private String approvalStatus;
}
