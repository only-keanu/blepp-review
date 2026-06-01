package com.kei.review.flashcards.dto;

import com.kei.review.flashcards.FlashcardConfidence;
import jakarta.validation.constraints.NotNull;

public record FlashcardReviewRequest(@NotNull FlashcardConfidence confidence) {
}
