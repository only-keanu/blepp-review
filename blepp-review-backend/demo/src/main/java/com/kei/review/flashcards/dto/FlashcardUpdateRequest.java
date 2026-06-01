package com.kei.review.flashcards.dto;

import jakarta.validation.constraints.Size;

public record FlashcardUpdateRequest(
    @Size(min = 1) String front,
    @Size(min = 1) String back,
    String category
) {
}
