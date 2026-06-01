package com.kei.review.exams.dto;

import java.util.UUID;

public record ExamSubmitResponse(
    UUID sessionId,
    Integer score,
    Integer totalQuestions,
    Integer correctCount,
    Integer unansweredCount,
    Integer timeTakenSeconds
) {
}
