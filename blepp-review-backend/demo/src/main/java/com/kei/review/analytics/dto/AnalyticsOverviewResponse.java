package com.kei.review.analytics.dto;

public record AnalyticsOverviewResponse(
    String accuracy,
    String studyStreak,
    String hoursStudied,
    String questionsDone
) {
}
