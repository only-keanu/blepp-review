package com.kei.review.flashcards;

import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    List<Flashcard> findByUserId(UUID userId);
    List<Flashcard> findByUserIdAndNextReviewLessThanEqual(UUID userId, LocalDate nextReview);
    List<Flashcard> findByUserIdAndNextReviewIsNull(UUID userId);
    long countByUserIdAndNextReviewLessThanEqual(UUID userId, LocalDate nextReview);
    long countByUserIdAndNextReviewIsNull(UUID userId);
    long countByUserIdAndConfidence(UUID userId, FlashcardConfidence confidence);
}
