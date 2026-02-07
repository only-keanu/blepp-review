package com.kei.review.generation.dto;

import com.kei.review.generation.GenerationStatus;
import java.util.UUID;

public record GenerationStatusResponse(UUID jobId, GenerationStatus status, Integer questionCount) {
}
