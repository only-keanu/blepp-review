package com.kei.review.exams.dto;

import java.util.UUID;

public record ExamResponse(
    UUID id,
    String title,
    Integer totalQuestions,
    Integer durationMinutes,
    String description
) {
}
