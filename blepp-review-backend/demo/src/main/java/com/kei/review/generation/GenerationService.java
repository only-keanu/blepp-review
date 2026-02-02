package com.kei.review.generation;

import com.kei.review.generation.dto.GenerationRunRequest;
import com.kei.review.generation.dto.GenerationRunResponse;
import com.kei.review.generation.dto.GenerationStatusResponse;
import com.kei.review.generation.dto.GenerationUploadResponse;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

public interface GenerationService {
    GenerationUploadResponse upload(UUID userId, MultipartFile file);
    GenerationRunResponse run(UUID userId, GenerationRunRequest request);
    GenerationStatusResponse status(UUID userId, UUID jobId);
}
