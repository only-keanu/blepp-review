package com.kei.review.practice.dto;

import java.time.Instant;
import java.util.UUID;

public record MistakeQuestionResponse(
    UUID questionId,
    UUID topicId,
    String topicName,
    String questionText,
    String userAnswer,
    String correctAnswer,
    Instant lastAttemptAt
) {
}
