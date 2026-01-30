package com.kei.review.generation;

import com.kei.review.generation.dto.GenerationRunRequest;
import com.kei.review.generation.dto.GenerationStatusResponse;
import com.kei.review.generation.dto.GenerationUploadResponse;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class GenerationServiceImpl implements GenerationService {
    @Override
    public GenerationUploadResponse upload(UUID userId, String filename) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public GenerationStatusResponse run(UUID userId, GenerationRunRequest request) {
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public GenerationStatusResponse status(UUID userId, UUID jobId) {
        throw new UnsupportedOperationException("Not implemented");
    }
}
