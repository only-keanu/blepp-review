package com.kei.review.generation;

import com.kei.review.auth.UserPrincipal;
import com.kei.review.generation.dto.GenerationRunRequest;
import com.kei.review.generation.dto.GenerationRunResponse;
import com.kei.review.generation.dto.GenerationStatusResponse;
import com.kei.review.generation.dto.GenerationUploadResponse;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/generation")
public class GenerationController {
    private final GenerationService generationService;

    public GenerationController(GenerationService generationService) {
        this.generationService = generationService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GenerationUploadResponse> upload(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(generationService.upload(principal.getId(), file));
    }

    @PostMapping("/run")
    public ResponseEntity<GenerationRunResponse> run(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestBody GenerationRunRequest request
    ) {
        return ResponseEntity.ok(generationService.run(principal.getId(), request));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<GenerationStatusResponse> status(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID jobId
    ) {
        return ResponseEntity.ok(generationService.status(principal.getId(), jobId));
    }
}
