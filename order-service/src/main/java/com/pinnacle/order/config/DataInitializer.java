package com.pinnacle.order.config;

import com.pinnacle.order.entity.CommissionRule;
import com.pinnacle.order.entity.DeliveryPartner;
import com.pinnacle.order.repository.CommissionRuleRepository;
import com.pinnacle.order.repository.DeliveryPartnerRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final CommissionRuleRepository commissionRuleRepository;

    @Override
    public void run(String... args) {
        seedDeliveryPartners();
        seedCommissionRule();
    }

    private void seedDeliveryPartners() {
        if (deliveryPartnerRepository.count() > 0) {
            return;
        }
        List<DeliveryPartner> partners = List.of(
                DeliveryPartner.builder().name("SwiftEx").avgDeliveryHours(12).active(true).currentLoad(0).capacity(50).build(),
                DeliveryPartner.builder().name("QuickShip").avgDeliveryHours(24).active(true).currentLoad(0).capacity(100).build(),
                DeliveryPartner.builder().name("MetroLogistics").avgDeliveryHours(36).active(true).currentLoad(0).capacity(80).build(),
                DeliveryPartner.builder().name("NationWide").avgDeliveryHours(48).active(true).currentLoad(0).capacity(200).build(),
                DeliveryPartner.builder().name("EconomyPost").avgDeliveryHours(72).active(true).currentLoad(0).capacity(500).build()
        );
        deliveryPartnerRepository.saveAll(partners);
        log.info("Seeded {} delivery partners", partners.size());
    }

    private void seedCommissionRule() {
        if (commissionRuleRepository.count() > 0) {
            return;
        }
        CommissionRule rule = CommissionRule.builder()
                .category(null)
                .ratePercent(new BigDecimal("10.00"))
                .active(true)
                .build();
        commissionRuleRepository.save(rule);
        log.info("Seeded default commission rule (10%)");
    }
}
