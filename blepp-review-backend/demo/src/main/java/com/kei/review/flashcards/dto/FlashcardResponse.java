package com.kei.review.flashcards.dto;

import com.kei.review.flashcards.FlashcardConfidence;
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
    LocalDate nextReview
) {
}
