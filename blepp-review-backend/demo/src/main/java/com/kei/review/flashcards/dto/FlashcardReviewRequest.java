package com.kei.review.flashcards.dto;

import com.kei.review.flashcards.FlashcardConfidence;
import com.kei.review.flashcards.FlashcardRating;
import jakarta.validation.constraints.AssertTrue;

public record FlashcardReviewRequest(FlashcardRating rating, FlashcardConfidence confidence) {
    public FlashcardReviewRequest(FlashcardRating rating) {
        this(rating, null);
    }

    public FlashcardReviewRequest(FlashcardConfidence confidence) {
        this(null, confidence);
    }

    @AssertTrue(message = "rating is required")
    public boolean hasRatingOrLegacyConfidence() {
        return rating != null || confidence != null;
    }
}
