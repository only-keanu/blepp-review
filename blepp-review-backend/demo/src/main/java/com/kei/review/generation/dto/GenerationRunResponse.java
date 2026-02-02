package com.kei.review.generation.dto;

import com.kei.review.generation.GenerationStatus;
import java.util.List;
import java.util.UUID;

public record GenerationRunResponse(
    UUID jobId,
    GenerationStatus status,
    Integer questionCount,
    List<GeneratedQuestionResponse> questions
) {
}
