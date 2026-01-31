package com.kei.review.analytics;

import com.kei.review.analytics.dto.AccuracyTrendResponse;
import com.kei.review.analytics.dto.AnalyticsOverviewResponse;
import com.kei.review.analytics.dto.ReadinessResponse;
import com.kei.review.analytics.dto.TopicMasteryResponse;
import com.kei.review.auth.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ResponseEntity<AnalyticsOverviewResponse> overview(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(analyticsService.overview(principal.getId()));
    }

    @GetMapping("/topic-mastery")
    public ResponseEntity<TopicMasteryResponse> topicMastery(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(analyticsService.topicMastery(principal.getId()));
    }

    @GetMapping("/readiness")
    public ResponseEntity<ReadinessResponse> readiness(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(analyticsService.readiness(principal.getId()));
    }

    @GetMapping("/accuracy-trend")
    public ResponseEntity<AccuracyTrendResponse> accuracyTrend(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(analyticsService.accuracyTrend(principal.getId()));
    }
}
