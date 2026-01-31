package com.kei.review.analytics;

import com.kei.review.analytics.dto.AnalyticsOverviewResponse;
import com.kei.review.analytics.dto.AccuracyTrendResponse;
import com.kei.review.analytics.dto.ReadinessResponse;
import com.kei.review.analytics.dto.TopicMasteryResponse;
import java.util.UUID;

public interface AnalyticsService {
    AnalyticsOverviewResponse overview(UUID userId);
    TopicMasteryResponse topicMastery(UUID userId);
    ReadinessResponse readiness(UUID userId);
    AccuracyTrendResponse accuracyTrend(UUID userId);
}
