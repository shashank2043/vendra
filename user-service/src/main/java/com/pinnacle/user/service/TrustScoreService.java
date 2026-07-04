package com.pinnacle.user.service;

import com.pinnacle.user.dto.TrustScoreResponse;
import com.pinnacle.user.entity.UserProfile;

import java.util.List;

public interface TrustScoreService {

    /** Trust score baseline floor for brand-new vendors. */
    double NEW_VENDOR_FLOOR = 60.0;

    /** Computes the 0-100 trust score for a vendor from its reputation fields. */
    double computeTrustScore(UserProfile vendor);

    /** Derives badge codes for a vendor. */
    List<String> computeBadges(UserProfile vendor);

    /** True if createdAt is within 30 days OR totalOrders < 5. */
    boolean computeIsNew(UserProfile vendor);

    /** Recomputes (in place, without persisting) trustScore, badges and isNew on the entity. */
    void applyTrustFields(UserProfile vendor);

    TrustScoreResponse getForVendor(String vendorId);

    List<TrustScoreResponse> getAllRanked();

    /** Pulls fresh order/review stats via Feign and recomputes+persists every vendor. */
    void recomputeAll();
}
