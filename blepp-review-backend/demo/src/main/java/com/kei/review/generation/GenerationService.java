package com.kei.review.generation;

import com.kei.review.generation.dto.GenerationRunRequest;
import com.kei.review.generation.dto.GenerationStatusResponse;
import com.kei.review.generation.dto.GenerationUploadResponse;
import java.util.UUID;

public interface GenerationService {
    GenerationUploadResponse upload(UUID userId, String filename);
    GenerationStatusResponse run(UUID userId, GenerationRunRequest request);
    GenerationStatusResponse status(UUID userId, UUID jobId);
}
