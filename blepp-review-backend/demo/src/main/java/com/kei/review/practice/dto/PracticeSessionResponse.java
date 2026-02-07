package com.kei.review.practice.dto;

import java.time.Instant;
import java.util.UUID;

public record PracticeSessionResponse(
    UUID id,
    UUID topicId,
    String topicName,
    Integer questionCount,
    Instant createdAt
) {
}
