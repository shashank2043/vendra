package com.pinnacle.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeUpdateRequest {
    // RESOLVED / ESCALATED
    @NotBlank(message = "Status is required")
    private String status;

    private String resolutionNotes;
}
