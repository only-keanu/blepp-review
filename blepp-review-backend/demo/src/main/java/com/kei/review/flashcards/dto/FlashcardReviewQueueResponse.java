package com.kei.review.flashcards.dto;

import com.kei.review.flashcards.FlashcardReviewQueueMode;
import java.time.Instant;
import java.util.List;

public record FlashcardReviewQueueResponse(
    FlashcardReviewQueueMode mode,
    List<FlashcardResponse> cards,
    long dueCount,
    long fallbackCount,
    Instant nextDueAt
) {
}
