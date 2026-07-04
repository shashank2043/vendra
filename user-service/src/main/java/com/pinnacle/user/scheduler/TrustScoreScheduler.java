package com.pinnacle.user.scheduler;

import com.pinnacle.user.service.TrustScoreService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TrustScoreScheduler {

    private static final Logger log = LoggerFactory.getLogger(TrustScoreScheduler.class);

    private final TrustScoreService trustScoreService;

    @Scheduled(fixedDelayString = "${trust.recompute.interval-ms:3600000}")
    public void recompute() {
        log.info("Scheduled trust score recomputation starting");
        try {
            trustScoreService.recomputeAll();
        } catch (Exception e) {
            log.error("Scheduled trust score recomputation failed: {}", e.getMessage());
        }
    }
}
