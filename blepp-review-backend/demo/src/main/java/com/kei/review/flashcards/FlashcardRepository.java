package com.kei.review.flashcards;

import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    List<Flashcard> findByUserId(UUID userId);
    List<Flashcard> findByUserEmail(String userEmail);
    List<Flashcard> findByUserEmailAndTopicId(String userEmail, UUID topicId);
    List<Flashcard> findByUserIdAndNextReviewLessThanEqual(UUID userId, LocalDate nextReview);
    List<Flashcard> findByUserIdAndNextReviewIsNull(UUID userId);
    List<Flashcard> findByUserEmailAndNextReviewLessThanEqual(String userEmail, LocalDate nextReview);
    List<Flashcard> findByUserEmailAndNextReviewIsNull(String userEmail);
    long countByUserId(UUID userId);
    long countByUserIdAndNextReviewLessThanEqual(UUID userId, LocalDate nextReview);
    long countByUserIdAndNextReviewIsNull(UUID userId);
    long countByUserIdAndConfidence(UUID userId, FlashcardConfidence confidence);
    long countByUserEmailAndNextReviewLessThanEqual(String userEmail, LocalDate nextReview);
    long countByUserEmailAndNextReviewIsNull(String userEmail);
    long countByUserEmailAndConfidence(String userEmail, FlashcardConfidence confidence);
    boolean existsByUserEmailAndFront(String userEmail, String front);
}
