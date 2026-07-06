package com.pinnacle.order.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "disputes")
public class Dispute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;

    private String vendorId;

    private String userId;

    @Column(length = 2000)
    private String reason;

    // OPEN / RESOLVED / ESCALATED
    private String status;

    @Column(length = 2000)
    private String resolutionNotes;

    private Instant createdAt;
}
