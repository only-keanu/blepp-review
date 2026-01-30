package com.kei.review.practice.dto;

import java.util.UUID;

public record AnswerAttemptRequest(
    UUID sessionId,
    UUID questionId,
    Integer selectedAnswerIndex,
    Integer timeTakenSeconds
) {
}
