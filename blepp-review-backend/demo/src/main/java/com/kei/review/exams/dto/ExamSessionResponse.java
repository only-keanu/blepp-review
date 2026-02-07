package com.kei.review.exams.dto;

import java.util.UUID;

public record ExamSessionResponse(
    UUID id,
    UUID examId,
    Integer totalQuestions,
    Integer durationMinutes
) {
}
