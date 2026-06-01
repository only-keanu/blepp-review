package com.kei.review.generation.dto;

import java.util.UUID;

public record GenerationRunRequest(
    UUID uploadId,
    Integer questionCount,
    String model,
    String difficulty,
    UUID topicId,
    String sourceLabel
) {
}
