package com.kei.review.flashcards.dto;

public record FlashcardQueueSummaryResponse(
    Long due,
    Long newCards,
    Long mastered
) {
}
