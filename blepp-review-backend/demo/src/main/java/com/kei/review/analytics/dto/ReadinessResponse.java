package com.kei.review.analytics.dto;

public record ReadinessResponse(Integer score, Integer accuracy, Integer consistency, Integer coverage, Integer mockExams) {
}
