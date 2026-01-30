package com.kei.review.analytics;

import com.kei.review.analytics.dto.AnalyticsOverviewResponse;
import com.kei.review.analytics.dto.ReadinessResponse;
import com.kei.review.analytics.dto.TopicMasteryResponse;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {
    @Override
    public AnalyticsOverviewResponse overview(UUID userId) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public TopicMasteryResponse topicMastery(UUID userId) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public ReadinessResponse readiness(UUID userId) {
        throw new UnsupportedOperationException("Not implemented");
    }
}
