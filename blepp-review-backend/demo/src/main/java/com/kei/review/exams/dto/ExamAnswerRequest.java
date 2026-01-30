package com.kei.review.exams.dto;

import java.util.UUID;

public record ExamAnswerRequest(
    UUID questionId,
    Integer selectedAnswerIndex,
    boolean flagged
) {
}
