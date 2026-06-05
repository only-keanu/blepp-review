package com.kei.review.flashcards;

import com.kei.review.auth.UserPrincipal;
import com.kei.review.flashcards.dto.FlashcardCreateRequest;
import com.kei.review.flashcards.dto.FlashcardResponse;
import com.kei.review.flashcards.dto.FlashcardReviewRequest;
import com.kei.review.flashcards.dto.FlashcardReviewQueueResponse;
import com.kei.review.flashcards.dto.FlashcardQueueSummaryResponse;
import com.kei.review.flashcards.dto.FlashcardUpdateRequest;
import com.kei.review.users.AccessService;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {
    private final FlashcardService flashcardService;
    private final AccessService accessService;

    public FlashcardController(FlashcardService flashcardService, AccessService accessService) {
        this.flashcardService = flashcardService;
        this.accessService = accessService;
    }

    @GetMapping
    public ResponseEntity<List<FlashcardResponse>> list(
        @RequestParam(required = false) UUID topicId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        accessService.requireStudyAccess(principal.getId());
        return ResponseEntity.ok(flashcardService.list(principal.getId(), topicId));
    }

    @GetMapping("/due")
    public ResponseEntity<List<FlashcardResponse>> listDue(
        @RequestParam(required = false) UUID topicId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        accessService.requireStudyAccess(principal.getId());
        return ResponseEntity.ok(flashcardService.listDue(principal.getId(), topicId));
    }

    @GetMapping("/review-queue")
    public ResponseEntity<FlashcardReviewQueueResponse> reviewQueue(
        @RequestParam(required = false) UUID topicId,
        @RequestParam(defaultValue = "20") int limit,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        accessService.requireStudyAccess(principal.getId());
        return ResponseEntity.ok(flashcardService.reviewQueue(principal.getId(), topicId, limit));
    }

    @GetMapping("/summary")
    public ResponseEntity<FlashcardQueueSummaryResponse> summary(
        @RequestParam(required = false) UUID topicId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        accessService.requireStudyAccess(principal.getId());
        return ResponseEntity.ok(flashcardService.summary(principal.getId(), topicId));
    }

    @PostMapping
    public ResponseEntity<FlashcardResponse> create(
        @Valid @RequestBody FlashcardCreateRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        accessService.requireStudyAccess(principal.getId());
        return ResponseEntity.ok(flashcardService.create(principal.getId(), request));
    }

    @PatchMapping("/{flashcardId}")
    public ResponseEntity<FlashcardResponse> update(
        @PathVariable UUID flashcardId,
        @Valid @RequestBody FlashcardUpdateRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        accessService.requireStudyAccess(principal.getId());
        return ResponseEntity.ok(flashcardService.update(principal.getId(), flashcardId, request));
    }

    @DeleteMapping("/{flashcardId}")
    public ResponseEntity<Void> delete(
        @PathVariable UUID flashcardId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        accessService.requireStudyAccess(principal.getId());
        flashcardService.delete(principal.getId(), flashcardId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{flashcardId}/review")
    public ResponseEntity<FlashcardResponse> review(
        @PathVariable UUID flashcardId,
        @Valid @RequestBody FlashcardReviewRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        accessService.requireStudyAccess(principal.getId());
        return ResponseEntity.ok(flashcardService.review(principal.getId(), flashcardId, request));
    }
}
