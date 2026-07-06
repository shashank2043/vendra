package com.pinnacle.order.service;

import com.pinnacle.order.entity.CommissionLedger;
import com.pinnacle.order.entity.CommissionRule;
import com.pinnacle.order.entity.Order;
import com.pinnacle.order.repository.CommissionLedgerRepository;
import com.pinnacle.order.repository.CommissionRuleRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommissionService {

    private static final Logger log = LoggerFactory.getLogger(CommissionService.class);

    private final CommissionRuleRepository ruleRepository;
    private final CommissionLedgerRepository ledgerRepository;

    @Transactional(readOnly = true)
    public List<CommissionRule> listRules() {
        return ruleRepository.findAll();
    }

    public CommissionRule createRule(String category, BigDecimal ratePercent, Boolean active) {
        CommissionRule rule = CommissionRule.builder()
                .category(category)
                .ratePercent(ratePercent)
                .active(active == null || active)
                .build();
        return ruleRepository.save(rule);
    }

    public CommissionRule updateRule(Long id, String category, BigDecimal ratePercent, Boolean active) {
        CommissionRule rule = ruleRepository.findById(id).orElse(null);
        if (rule == null) {
            return null;
        }
        if (category != null) rule.setCategory(category);
        if (ratePercent != null) rule.setRatePercent(ratePercent);
        if (active != null) rule.setActive(active);
        return ruleRepository.save(rule);
    }

    @Transactional(readOnly = true)
    public List<CommissionLedger> getLedger(String vendorId) {
        if (vendorId == null || vendorId.isBlank()) {
            return ledgerRepository.findAll();
        }
        return ledgerRepository.findByVendorId(vendorId);
    }

    /**
     * Creates a commission ledger entry for a confirmed order using the active rule.
     */
    public void recordCommission(Order order) {
        BigDecimal rate = resolveRate(order.getVendorId());
        BigDecimal orderAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal commissionAmount = orderAmount.multiply(rate)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal netAmount = orderAmount.subtract(commissionAmount);

        CommissionLedger ledger = CommissionLedger.builder()
                .vendorId(order.getVendorId())
                .orderId(String.valueOf(order.getId()))
                .orderAmount(orderAmount)
                .commissionAmount(commissionAmount)
                .netAmount(netAmount)
                .createdAt(Instant.now())
                .build();
        ledgerRepository.save(ledger);
        log.info("Recorded commission for order ID: {} (rate={}%, commission={})", order.getId(), rate, commissionAmount);
    }

    private BigDecimal resolveRate(String vendorId) {
        // No category tracking at order level yet -> use the default active rule.
        return ruleRepository.findFirstByCategoryIsNullAndActiveTrue()
                .map(CommissionRule::getRatePercent)
                .orElseGet(() -> ruleRepository.findByActiveTrue().stream()
                        .findFirst()
                        .map(CommissionRule::getRatePercent)
                        .orElse(BigDecimal.TEN));
    }
}
