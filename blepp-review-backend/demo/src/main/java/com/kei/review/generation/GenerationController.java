package com.kei.review.generation;

import com.kei.review.generation.dto.GenerationRunRequest;
import com.kei.review.generation.dto.GenerationStatusResponse;
import com.kei.review.generation.dto.GenerationUploadResponse;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/generation")
public class GenerationController {
    private final GenerationService generationService;

    public GenerationController(GenerationService generationService) {
        this.generationService = generationService;
    }

    @PostMapping("/upload")
    public ResponseEntity<GenerationUploadResponse> upload(MultipartFile file) {
        UUID userId = null;
        return ResponseEntity.ok(generationService.upload(userId, file.getOriginalFilename()));
    }

    @PostMapping("/run")
    public ResponseEntity<GenerationStatusResponse> run(@RequestBody GenerationRunRequest request) {
        UUID userId = null;
        return ResponseEntity.ok(generationService.run(userId, request));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<GenerationStatusResponse> status(@PathVariable UUID jobId) {
        UUID userId = null;
        return ResponseEntity.ok(generationService.status(userId, jobId));
    }
}
