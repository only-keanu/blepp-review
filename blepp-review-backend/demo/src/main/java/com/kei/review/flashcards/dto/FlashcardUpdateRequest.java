package com.kei.review.flashcards.dto;

public record FlashcardUpdateRequest(
    String front,
    String back,
    String category
) {
}
