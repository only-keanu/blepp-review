package com.kei.review.flashcards.dto;

import com.kei.review.flashcards.FlashcardConfidence;
import com.kei.review.flashcards.FlashcardReviewState;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record FlashcardResponse(
    UUID id,
    UUID topicId,
    String topicName,
    String front,
    String back,
    String category,
    FlashcardConfidence confidence,
    LocalDate nextReview,
    FlashcardReviewState reviewState,
    Instant dueAt,
    Integer intervalDays,
    Integer easeFactor,
    Integer repetitionCount,
    Integer lapseCount,
    Instant lastReviewedAt
) {
}
