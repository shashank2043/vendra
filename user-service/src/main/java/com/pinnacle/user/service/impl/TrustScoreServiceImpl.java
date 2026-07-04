package com.pinnacle.user.service.impl;

import com.pinnacle.user.client.OrderAnalyticsClient;
import com.pinnacle.user.client.ReviewClient;
import com.pinnacle.user.dto.ApiResponse;
import com.pinnacle.user.dto.TrustScoreResponse;
import com.pinnacle.user.entity.UserProfile;
import com.pinnacle.user.exception.ResourceNotFoundException;
import com.pinnacle.user.repository.UserProfileRepository;
import com.pinnacle.user.service.TrustScoreService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrustScoreServiceImpl implements TrustScoreService {

    private static final Logger log = LoggerFactory.getLogger(TrustScoreServiceImpl.class);
    private static final String VENDOR_ROLE = "VENDOR";
    private static final String TRUSTED_ROLE = "admin";

    private final UserProfileRepository userProfileRepository;
    private final OrderAnalyticsClient orderAnalyticsClient;
    private final ReviewClient reviewClient;

    @Override
    public double computeTrustScore(UserProfile v) {
        double rating = nz(v.getAvgRating());
        double onTime = nz(v.getOnTimeRate());
        double cancel = nz(v.getCancellationRate());
        double dispute = nz(v.getDisputeRate());

        double score = 0.40 * (rating / 5.0 * 100.0)
                + 0.25 * onTime
                + 0.20 * (100.0 - cancel)
                + 0.15 * (100.0 - dispute);

        if (computeIsNew(v)) {
            score = Math.max(score, NEW_VENDOR_FLOOR);
        }
        return clamp(score);
    }

    @Override
    public List<String> computeBadges(UserProfile v) {
        List<String> badges = new ArrayList<>();
        double rating = nz(v.getAvgRating());
        double onTime = nz(v.getOnTimeRate());
        double score = nz(v.getTrustScore());
        int orders = v.getTotalOrders() == null ? 0 : v.getTotalOrders();
        boolean isNew = computeIsNew(v);

        if (rating >= 4.5) badges.add("TOP_RATED");
        if (onTime >= 95) badges.add("FAST_SHIPPER");
        if (score >= 80) badges.add("TRUSTED");
        if (isNew && score >= 65) badges.add("RISING_STAR");
        if (orders >= 50) badges.add("BEST_SELLER");
        return badges;
    }

    @Override
    public boolean computeIsNew(UserProfile v) {
        int orders = v.getTotalOrders() == null ? 0 : v.getTotalOrders();
        if (orders < 5) return true;
        Instant createdAt = v.getCreatedAt();
        if (createdAt == null) return false;
        return createdAt.isAfter(Instant.now().minus(30, ChronoUnit.DAYS));
    }

    @Override
    public void applyTrustFields(UserProfile v) {
        v.setIsNew(computeIsNew(v));
        double score = computeTrustScore(v);
        v.setTrustScore(score);
        // badges depend on freshly computed score
        v.setBadges(String.join(",", computeBadges(v)));
    }

    @Override
    @Transactional(readOnly = true)
    public TrustScoreResponse getForVendor(Long vendorId) {
        List<TrustScoreResponse> ranked = getAllRanked();
        return ranked.stream()
                .filter(t -> t.getVendorId().equals(vendorId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found for id: " + vendorId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrustScoreResponse> getAllRanked() {
        List<UserProfile> vendors = userProfileRepository.findByRole(VENDOR_ROLE);
        vendors.sort(Comparator.comparingDouble((UserProfile v) -> nz(v.getTrustScore())).reversed());
        List<TrustScoreResponse> result = new ArrayList<>();
        int rank = 1;
        for (UserProfile v : vendors) {
            result.add(toResponse(v, rank++));
        }
        return result;
    }

    @Override
    @Transactional
    public void recomputeAll() {
        List<UserProfile> vendors = userProfileRepository.findByRole(VENDOR_ROLE);
        log.info("Recomputing trust scores for {} vendors", vendors.size());
        for (UserProfile v : vendors) {
            try {
                pullOrderStats(v);
                pullReviewStats(v);
                applyTrustFields(v);
                userProfileRepository.save(v);
            } catch (Exception e) {
                log.error("Failed to recompute trust score for vendor id {}: {}", v.getId(), e.getMessage());
            }
        }
    }

    private void pullOrderStats(UserProfile v) {
        ApiResponse<Map<String, Object>> resp = orderAnalyticsClient.getAnalytics(v.getId(), TRUSTED_ROLE);
        if (resp == null || resp.getData() == null) return;
        Map<String, Object> data = resp.getData();
        Integer totalOrders = toInt(data.get("totalOrders"));
        if (totalOrders != null) v.setTotalOrders(totalOrders);
        Double cancellationRate = toDouble(data.get("cancellationRate"));
        if (cancellationRate != null) v.setCancellationRate(cancellationRate);
        Double onTimeRate = toDouble(data.get("onTimeRate"));
        if (onTimeRate != null) v.setOnTimeRate(onTimeRate);
        Double disputeRate = toDouble(data.get("disputeRate"));
        if (disputeRate != null) v.setDisputeRate(disputeRate);
    }

    private void pullReviewStats(UserProfile v) {
        ApiResponse<List<Map<String, Object>>> resp = reviewClient.getReviews(v.getId(), TRUSTED_ROLE);
        if (resp == null || resp.getData() == null || resp.getData().isEmpty()) return;
        List<Map<String, Object>> reviews = resp.getData();
        double sum = 0;
        int count = 0;
        for (Map<String, Object> r : reviews) {
            Double rating = toDouble(r.get("rating"));
            if (rating != null) {
                sum += rating;
                count++;
            }
        }
        if (count > 0) {
            v.setAvgRating(sum / count);
        }
    }

    private TrustScoreResponse toResponse(UserProfile v, int rank) {
        return TrustScoreResponse.builder()
                .vendorId(v.getId())
                .trustScore(v.getTrustScore())
                .avgRating(v.getAvgRating())
                .totalOrders(v.getTotalOrders())
                .onTimeRate(v.getOnTimeRate())
                .cancellationRate(v.getCancellationRate())
                .disputeRate(v.getDisputeRate())
                .badges(parseBadges(v.getBadges()))
                .isNew(v.getIsNew())
                .rank(rank)
                .build();
    }

    static List<String> parseBadges(String badges) {
        if (badges == null || badges.isBlank()) return new ArrayList<>();
        return Arrays.stream(badges.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private static double nz(Double d) {
        return d == null ? 0.0 : d;
    }

    private static double clamp(double v) {
        return Math.max(0.0, Math.min(100.0, v));
    }

    private static Integer toInt(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.intValue();
        try {
            return Integer.valueOf(o.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Double toDouble(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.doubleValue();
        try {
            return Double.valueOf(o.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
