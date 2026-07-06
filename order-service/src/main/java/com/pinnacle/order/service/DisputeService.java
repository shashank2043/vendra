package com.pinnacle.order.service;

import com.pinnacle.order.dto.DisputeRequest;
import com.pinnacle.order.dto.DisputeResponse;
import com.pinnacle.order.entity.Dispute;
import com.pinnacle.order.exception.ResourceNotFoundException;
import com.pinnacle.order.repository.DisputeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DisputeService {

    private final DisputeRepository disputeRepository;

    @Transactional(readOnly = true)
    public List<DisputeResponse> list(String status) {
        List<Dispute> disputes = (status == null || status.isBlank())
                ? disputeRepository.findAll()
                : disputeRepository.findByStatus(status.toUpperCase());
        return disputes.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public DisputeResponse create(DisputeRequest request) {
        Dispute dispute = Dispute.builder()
                .orderId(request.getOrderId())
                .vendorId(request.getVendorId())
                .userId(request.getUserId())
                .reason(request.getReason())
                .status("OPEN")
                .createdAt(Instant.now())
                .build();
        return toResponse(disputeRepository.save(dispute));
    }

    public DisputeResponse update(Long id, String status, String resolutionNotes) {
        Dispute dispute = disputeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found with id: " + id));
        if (status != null && !status.isBlank()) {
            dispute.setStatus(status.toUpperCase());
        }
        if (resolutionNotes != null) {
            dispute.setResolutionNotes(resolutionNotes);
        }
        return toResponse(disputeRepository.save(dispute));
    }

    private DisputeResponse toResponse(Dispute dispute) {
        return DisputeResponse.builder()
                .id(dispute.getId())
                .orderId(dispute.getOrderId())
                .vendorId(dispute.getVendorId())
                .userId(dispute.getUserId())
                .reason(dispute.getReason())
                .status(dispute.getStatus())
                .resolutionNotes(dispute.getResolutionNotes())
                .createdAt(dispute.getCreatedAt())
                .build();
    }
}
