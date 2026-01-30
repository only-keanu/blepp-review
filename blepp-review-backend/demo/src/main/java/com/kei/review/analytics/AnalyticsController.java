package com.kei.review.analytics;

import com.kei.review.analytics.dto.AnalyticsOverviewResponse;
import com.kei.review.analytics.dto.ReadinessResponse;
import com.kei.review.analytics.dto.TopicMasteryResponse;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewResponse> overview() {
        UUID userId = null;
        return ResponseEntity.ok(analyticsService.overview(userId));
    }

    @GetMapping("/topic-mastery")
    public ResponseEntity<TopicMasteryResponse> topicMastery() {
        UUID userId = null;
        return ResponseEntity.ok(analyticsService.topicMastery(userId));
    }

    @GetMapping("/readiness")
    public ResponseEntity<ReadinessResponse> readiness() {
        UUID userId = null;
        return ResponseEntity.ok(analyticsService.readiness(userId));
    }
}
