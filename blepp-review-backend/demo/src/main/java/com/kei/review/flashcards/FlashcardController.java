package com.kei.review.flashcards;

import com.kei.review.auth.UserPrincipal;
import com.kei.review.flashcards.dto.FlashcardCreateRequest;
import com.kei.review.flashcards.dto.FlashcardResponse;
import com.kei.review.flashcards.dto.FlashcardReviewRequest;
import com.kei.review.flashcards.dto.FlashcardUpdateRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {
    private final FlashcardService flashcardService;

    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @GetMapping
    public ResponseEntity<List<FlashcardResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(flashcardService.list(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<FlashcardResponse> create(
        @RequestBody FlashcardCreateRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(flashcardService.create(principal.getId(), request));
    }

    @PatchMapping("/{flashcardId}")
    public ResponseEntity<FlashcardResponse> update(
        @PathVariable UUID flashcardId,
        @RequestBody FlashcardUpdateRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(flashcardService.update(principal.getId(), flashcardId, request));
    }

    @DeleteMapping("/{flashcardId}")
    public ResponseEntity<Void> delete(
        @PathVariable UUID flashcardId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        flashcardService.delete(principal.getId(), flashcardId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{flashcardId}/review")
    public ResponseEntity<FlashcardResponse> review(
        @PathVariable UUID flashcardId,
        @RequestBody FlashcardReviewRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(flashcardService.review(principal.getId(), flashcardId, request));
    }
}
