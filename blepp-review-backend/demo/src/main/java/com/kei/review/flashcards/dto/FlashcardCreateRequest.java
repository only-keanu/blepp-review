package com.kei.review.flashcards.dto;

import java.util.UUID;

public record FlashcardCreateRequest(
    UUID topicId,
    String front,
    String back,
    String category
) {
}
