package com.kei.review.analytics.dto;

import java.util.List;

public record AccuracyTrendResponse(List<AccuracyPoint> points) {
    public record AccuracyPoint(String label, Integer accuracy, Integer total, Integer correct) {}
}
