package com.kei.review.flashcards;

import com.kei.review.flashcards.dto.FlashcardCreateRequest;
import com.kei.review.flashcards.dto.FlashcardResponse;
import com.kei.review.flashcards.dto.FlashcardReviewRequest;
import com.kei.review.flashcards.dto.FlashcardUpdateRequest;
import java.util.List;
import java.util.UUID;

public interface FlashcardService {
    List<FlashcardResponse> list(UUID userId);
    FlashcardResponse create(UUID userId, FlashcardCreateRequest request);
    FlashcardResponse update(UUID userId, UUID flashcardId, FlashcardUpdateRequest request);
    void delete(UUID userId, UUID flashcardId);
    FlashcardResponse review(UUID userId, UUID flashcardId, FlashcardReviewRequest request);
}
