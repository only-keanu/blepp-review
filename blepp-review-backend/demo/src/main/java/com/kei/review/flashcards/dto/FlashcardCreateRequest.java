package com.kei.review.flashcards.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record FlashcardCreateRequest(
    @NotNull UUID topicId,
    @NotBlank String front,
    @NotBlank String back,
    String category
) {
}
