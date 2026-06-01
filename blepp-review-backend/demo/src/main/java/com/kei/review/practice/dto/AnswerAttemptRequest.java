package com.kei.review.practice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AnswerAttemptRequest(
    @NotNull UUID sessionId,
    @NotNull UUID questionId,
    @Min(0) Integer selectedAnswerIndex,
    @Min(0) Integer timeTakenSeconds
) {
}
