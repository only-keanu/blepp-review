package com.kei.review.exams.dto;

import java.time.Instant;
import java.util.UUID;

public record ExamSessionSummaryResponse(
    UUID id,
    UUID examId,
    String title,
    String status,
    Instant startedAt,
    Instant submittedAt,
    Integer score,
    Integer totalQuestions,
    Integer durationMinutes,
    Integer timeTakenSeconds,
    Long answeredCount
) {
}
