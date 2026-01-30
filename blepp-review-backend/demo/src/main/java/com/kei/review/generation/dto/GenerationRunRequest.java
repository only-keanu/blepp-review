package com.kei.review.generation.dto;

import java.util.UUID;

public record GenerationRunRequest(UUID uploadId, Integer questionCount, String model) {
}
