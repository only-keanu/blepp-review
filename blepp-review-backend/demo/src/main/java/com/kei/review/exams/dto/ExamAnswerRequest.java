package com.kei.review.exams.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ExamAnswerRequest(
    @NotNull UUID questionId,
    @Min(0) Integer selectedAnswerIndex,
    boolean flagged
) {
}
